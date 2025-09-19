## 任务介绍

当前任务使用 Celery
实现，实施方案请查看 [#225](https://github.com/fastapi-practices/fastapi_best_architecture/discussions/225)

## 添加任务

> [!IMPORTANT]
> 由于 Celery 任务扫描规则，使其对任务的目录结构要求及其严格，务必在 celery_task 目录下添加任务

### 简单任务

可以直接在 `tasks.py` 文件内编写相关任务代码

### 层级任务

如果你想对任务进行目录层级划分，使任务结构更加清晰，你可以新建任意目录，但必须注意的是

1. 新建目录后，务必更新任务配置 `CELERY_TASKS_PACKAGES`，将新建目录添加到此列表
2. 在新建目录下，务必添加 `tasks.py` 文件，并在此文件中编写相关任务代码

## 消息代理

你可以通过 `CELERY_BROKER` 控制消息代理选择，它支持 redis 和 rabbitmq

对于本地调试，建议使用 redis

对于线上环境，强制使用 rabbitmq

## serverless

```
{
  'function_result': {
    'body': {
      'functionId': '43525591-24c7-4ec0-b699-e07941a9fac6',
      'functionName': 'mcp-test1',
      'functionArn': 'acs:fc:cn-beijing:1718551483493269:functions/mcp-test1',
      'description': '',
      'runtime': 'custom-container',
      'handler': 'index.handler',
      'timeout': 600,
      'codeSize': 0,
      'codeChecksum': '',
      'memorySize': 512,
      'cpu': 0.5,
      'diskSize': 512,
      'environmentVariables': {
        'a': 'b'
      },
      'createdTime': '2025-04-13T03:53:15Z',
      'lastModifiedTime': '2025-04-13T03:53:15Z',
      'layers': None,
      'role': '',
      'instanceConcurrency': 10,
      'customDNS': None,
      'instanceLifecycleConfig': None,
      'customRuntimeConfig': None,
      'customContainerConfig': {
        'accelerationInfo': None,
        'accelerationType': None,
        'entrypoint': [],
        'command': [
          'mcp-proxy',
          '--sse-port',
          '8080',
          '--sse-host',
          '0.0.0.0',
          '--allow-origin',
          '*',
          '--pass-environment',
          '--',
          'mcp-server-sentry',
          '--auth-tokenadad'
        ],
        'port': 8080,
        'healthCheckConfig': None,
        'image': 'registry.cn-beijing.aliyuncs.com/biyao/public:python-mcp-server-sentry-2025.1.14-v7',
        'acrInstanceId': None,
        'resolvedImageUri': 'registry.cn-beijing.aliyuncs.com/biyao/public@sha256:2d191cb3c402dfd548e3397485f4ebdbb9bcba7b5bd19801f4866ba279f1faf9',
        'registryConfig': None,
        'lastAvailableImageAcclConfigInternal': None,
        'imageAcclConfig': None,
        'serverlessImage': None
      },
      'gpuConfig': None,
      'internetAccess': True,
      'disableOndemand': False,
      'vpcConfig': {
        'vpcId': '',
        'vSwitchIds': [],
        'securityGroupId': '',
        'anytunnelViaENI': None,
        'role': None
      },
      'logConfig': {
        'project': '',
        'logstore': '',
        'enableRequestMetrics': False,
        'enableInstanceMetrics': False,
        'logBeginRule': None
      },
      'tracingConfig': {
        'type': None,
        'params': None,
        'jaegerConfig': None
      },
      'nasConfig': {
        'userId': 0,
        'groupId': 0,
        'mountPoints': []
      },
      'ossMountConfig': {
        'mountPoints': []
      },
      'tags': None,
      'state': None,
      'stateReason': None,
      'stateReasonCode': None,
      'lastUpdateStatus': None,
      'lastUpdateStatusReason': None,
      'lastUpdateStatusReasonCode': None,
      'version': 'LATEST',
      'invocationRestriction': None
    },
    'headers': {
      'access-control-expose-headers': 'Date,x-fc-request-id,x-fc-error-type,x-fc-code-checksum,x-fc-invocation-duration,x-fc-max-memory-usage,x-fc-log-result,x-fc-invocation-code-version,x-fc-instance-id',
      'content-type': 'application/json; charset=utf-8',
      'etag': '7210d53e4b3756c52e401e02a856071f',
      'x-fc-request-id': '1-67fb352a-13c977c3-fcd79f7a7b63',
      'date': 'Sun, 13 Apr 2025 03:53:15 GMT',
      'content-length': '1829'
    },
    'statusCode': 200
  },
  'trigger_result': {
    'body': {
      'triggerName': 'mcp-test1',
      'description': '',
      'triggerId': 'f414e9a0-48b9-4f28-8c2d-eccaf5566647',
      'sourceArn': None,
      'triggerType': 'http',
      'invocationRole': None,
      'qualifier': 'LATEST',
      'triggerConfig': '{"methods":["GET"],"authType":"function","disableURLInternet":false}',
      'createdTime': '2025-04-13T03:53:15Z',
      'lastModifiedTime': '2025-04-13T03:53:15Z',
      'status': None,
      'targetArn': None,
      'httpTrigger': {
        'urlInternet': 'https://mcp-test-lhdiaezxpu.cn-beijing.fcapp.run',
        'urlIntranet': 'https://mcp-test-lhdiaezxpu.cn-beijing-vpc.fcapp.run'
      }
    },
    'headers': {
      'access-control-expose-headers': 'Date,x-fc-request-id,x-fc-error-type,x-fc-code-checksum,x-fc-invocation-duration,x-fc-max-memory-usage,x-fc-log-result,x-fc-invocation-code-version,x-fc-instance-id',
      'content-type': 'application/json; charset=utf-8',
      'etag': '8f89a9d4cfc79487c108258dd6d49f12',
      'x-fc-request-id': '1-67fb352b-13ddd5b4-6fb3693025a0',
      'date': 'Sun, 13 Apr 2025 03:53:15 GMT',
      'content-length': '533'
    },
    'statusCode': 200
  }
}
```
