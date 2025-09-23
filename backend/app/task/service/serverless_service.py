import traceback

from typing import Any, List

from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_openapi.client import Client as OpenApiClient
from alibabacloud_tea_util import models as util_models
from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.schema.mcp import UpdateMcpServerParam
from app.task.schema.task import CustomContainerConfig, ServerlessParam
from core.conf import settings
from database.db import async_db_session
from loguru import logger
from mcp import ClientSession
from mcp.client.sse import sse_client
from tenacity import retry, stop_after_attempt, wait_fixed


class ServerlessService:
    def __init__(self):
        config = open_api_models.Config(
            endpoint=settings.SERVERLESS_ENDPOINT,
            access_key_id=settings.SERVERLESS_ACCESS_KEY_ID,
            access_key_secret=settings.SERVERLESS_ACCESS_KEY_SECRET,
        )
        self.openai_client = OpenApiClient(config)

    @staticmethod
    def create_trigger_api_info(
        function_name: str,
    ) -> open_api_models.Params:
        """
        API 相关
        @param path: string Path parameters
        @return: OpenApi.Params
        """
        params = open_api_models.Params(
            # 接口名称,
            action='CreateTrigger',
            # 接口版本,
            version='2023-03-30',
            # 接口协议,
            protocol='HTTPS',
            # 接口 HTTP 方法,
            method='POST',
            auth_type='AK',
            style='FC',
            # 接口 PATH,
            pathname=f'/2023-03-30/functions/{function_name}/triggers',
            # 接口请求体内容格式,
            req_body_type='json',
            # 接口响应体内容格式,
            body_type='json',
        )
        return params

    @staticmethod
    def create_function_api_info() -> open_api_models.Params:
        """
        创建函数
        @param path: string Path parameters
        @return: OpenApi.Params
        """
        params = open_api_models.Params(
            # 接口名称,
            action='CreateFunction',
            # 接口版本,
            version='2023-03-30',
            # 接口协议,
            protocol='HTTPS',
            # 接口 HTTP 方法,
            method='POST',
            auth_type='AK',
            style='FC',
            # 接口 PATH,
            pathname='/2023-03-30/functions',
            # 接口请求体内容格式,
            req_body_type='json',
            # 接口响应体内容格式,
            body_type='json',
        )
        return params

    async def create_function(self, function_name: str, image: str, envs: dict[str, Any], run_cmd: List[str]) -> dict:
        """ """
        body = ServerlessParam(
            environmentVariables=envs,
            timeout=600,
            instanceConcurrency=10,
            cpu=0.5,
            diskSize=512,
            memorySize=512,
            handler='index.handler',
            runtime='custom-container',
            functionName=function_name,
            customContainerConfig=CustomContainerConfig(
                image=image,
                port=8080,
                command=run_cmd,
            ),
        )

        # runtime options
        runtime = util_models.RuntimeOptions()
        request = open_api_models.OpenApiRequest(body=body.model_dump())
        result = await self.openai_client.call_api_async(self.create_function_api_info(), request, runtime)
        logger.info(f'create function success: {function_name}, result: {result}')
        return result

    async def create_trigger(self, function_name) -> dict:
        params = self.create_trigger_api_info(function_name)
        # body params
        body = {
            'triggerType': 'http',
            'triggerConfig': '{"methods":["GET","POST","PUT","OPTIONS","HEAD"],"authType":"anonymous","disableURLInternet":false}',
            'triggerName': function_name,
        }
        # runtime options
        runtime = util_models.RuntimeOptions()
        request = open_api_models.OpenApiRequest(body=body)
        result = await self.openai_client.call_api_async(params, request, runtime)
        logger.info(f'create trigger success: {function_name}, result: {result}')
        return result

    @retry(stop=stop_after_attempt(20), wait=wait_fixed(3))
    async def create_see(self, sse_url: str) -> dict:
        async with sse_client(sse_url) as streams:
            async with ClientSession(streams[0], streams[1]) as session:
                capabilities = await session.initialize()
                logger.info(f'capabilities: {capabilities}')
                if not capabilities:
                    return {}

                result = {
                    'capabilities': capabilities.model_dump(),
                }
                capabilities = capabilities.capabilities
                if capabilities.tools:
                    try:
                        tools = await session.list_tools()
                        result.update({'tools': tools.model_dump()})
                    except Exception:
                        result.update({'tools': None})

                if capabilities.prompts:
                    try:
                        prompts = await session.list_prompts()
                        result.update({'prompts': prompts.model_dump()})
                    except Exception:
                        result.update({'prompts': None})

                if capabilities.resources:
                    try:
                        resources = await session.list_resources()
                        result.update({'resources': resources.model_dump()})
                    except Exception:
                        result.update({'resources': None})

                return result

    async def create_serverless(self, mcp_server_id, function_name, image, envs, run_cmd) -> dict:
        """
        根据mcp_id更新
        """
        # 创建
        try:
            function_result = await self.create_function(function_name, image, envs, run_cmd)
        except Exception as e:
            logger.error(e)
            return {}

        try:
            trigger_result = await self.create_trigger(function_name)
        except Exception as e:
            logger.error(e)
            return {}
        # httpTrigger.urlInternet
        try:
            sse_url = trigger_result['body']['httpTrigger']['urlInternet'] + '/sse'
            sse_result = await self.create_see(sse_url)
            logger.info(f'sse_result: {sse_result}')
        except Exception as e:
            logger.error(e)
            traceback.print_exc()
            return {}
        # 写入数据库
        param = UpdateMcpServerParam(
            mcp_endpoint=trigger_result['body']['httpTrigger']['urlInternet'],
            capabilities=sse_result['capabilities'],
            tools=sse_result.get('tools', None),
            prompts=sse_result.get('prompts', None),
            resources=sse_result.get('resources', None),
            is_public=True,
        )
        async with async_db_session.begin() as db:
            rowcount = await mcp_server_dao.update_mcp_server(db, mcp_server_id, param)
            logger.info(f'update mcp_server success: {rowcount}')

        return {
            'function_result': function_result,
            'trigger_result': trigger_result,
            'sse_result': sse_result,
        }


serverless_service: ServerlessService = ServerlessService()
