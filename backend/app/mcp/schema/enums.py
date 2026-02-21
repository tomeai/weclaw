from enum import Enum


class TransportType(Enum):
    sse = 'sse'
    http = 'streamable-http'
    stdio = 'stdio'


class ServerType(Enum):
    hosted = 'hosted'
    local = 'local'


class CompileType(Enum):
    package = 'package'
    openapi = 'openapi'


class RuntimeType(str, Enum):
    mcp_gateway = 'mcp_gateway'
    fastmcp = 'fastmcp'
    aliyun_serverless = 'aliyun_serverless'
    tencent_serverless = 'tencent_serverless'
