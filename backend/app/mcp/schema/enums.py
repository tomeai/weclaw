from enum import Enum


class TransportType(Enum):
    sse = 'sse'
    streamable_http = 'streamable_http'
    stdio = 'stdio'


class ServerType(Enum):
    remote = 'remote'
    local = 'local'


class CompileType(Enum):
    package = 'package'
    openapi = 'openapi'
