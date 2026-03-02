import asyncio

from fastmcp import Client
from fastmcp.mcp_config import MCPConfig

# In-memory server (ideal for testing)
# server = FastMCP("TestServer")
# client = Client(server)

# HTTP server
# client = Client("https://example.com/mcp")

# tools {'meta': None, 'nextCursor': None, 'tools': [{'name': 'get-current-date', 'title': None, 'description': '获取当前日期，以上海时区（Asia/Shanghai, UTC+8）为准，返回格式为 "yyyy-MM-dd"。主要用于解析用户提到的相对日期（如“明天”、“下周三”），提供准确的日期输入。', 'inputSchema': {'$schema': 'http://json-schema.org/draft-07/schema#', 'type': 'object', 'properties': {}}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-stations-code-in-city', 'title': None, 'description': '通过中文城市名查询该城市 **所有** 火车站的名称及其对应的 `station_code`，结果是一个包含多个车站信息的列表。', 'inputSchema': {'type': 'object', 'properties': {'city': {'type': 'string', 'description': '中文城市名称，例如："北京", "上海"'}}, 'required': ['city'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-station-code-of-citys', 'title': None, 'description': '通过中文城市名查询代表该城市的 `station_code`。此接口主要用于在用户提供**城市名**作为出发地或到达地时，为接口准备 `station_code` 参数。', 'inputSchema': {'type': 'object', 'properties': {'citys': {'type': 'string', 'description': '要查询的城市，比如"北京"。若要查询多个城市，请用|分割，比如"北京|上海"。'}}, 'required': ['citys'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-station-code-by-names', 'title': None, 'description': '通过具体的中文车站名查询其 `station_code` 和车站名。此接口主要用于在用户提供**具体车站名**作为出发地或到达地时，为接口准备 `station_code` 参数。', 'inputSchema': {'type': 'object', 'properties': {'stationNames': {'type': 'string', 'description': '具体的中文车站名称，例如："北京南", "上海虹桥"。若要查询多个站点，请用|分割，比如"北京南|上海虹桥"。'}}, 'required': ['stationNames'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-station-by-telecode', 'title': None, 'description': '通过车站的 `station_telecode` 查询车站的详细信息，包括名称、拼音、所属城市等。此接口主要用于在已知 `telecode` 的情况下获取更完整的车站数据，或用于特殊查询及调试目的。一般用户对话流程中较少直接触发。', 'inputSchema': {'type': 'object', 'properties': {'stationTelecode': {'type': 'string', 'description': '车站的 `station_telecode` (3位字母编码)'}}, 'required': ['stationTelecode'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-tickets', 'title': None, 'description': '查询12306余票信息。', 'inputSchema': {'type': 'object', 'properties': {'date': {'type': 'string', 'minLength': 10, 'maxLength': 10, 'description': '查询日期，格式为 "yyyy-MM-dd"。如果用户提供的是相对日期（如“明天”），请务必先调用 `get-current-date` 接口获取当前日期，并计算出目标日期。'}, 'fromStation': {'type': 'string', 'description': '出发地的 `station_code` 。必须是通过 `get-station-code-by-names` 或 `get-station-code-of-citys` 接口查询得到的编码，严禁直接使用中文地名。'}, 'toStation': {'type': 'string', 'description': '到达地的 `station_code` 。必须是通过 `get-station-code-by-names` 或 `get-station-code-of-citys` 接口查询得到的编码，严禁直接使用中文地名。'}, 'trainFilterFlags': {'type': 'string', 'pattern': '^[GDZTKOFS]*$', 'maxLength': 8, 'default': '', 'description': '车次筛选条件，默认为空，即不筛选。支持多个标志同时筛选。例如用户说“高铁票”，则应使用 "G"。可选标志：[G(高铁/城际),D(动车),Z(直达特快),T(特快),K(快速),O(其他),F(复兴号),S(智能动车组)]'}, 'earliestStartTime': {'type': 'number', 'minimum': 0, 'maximum': 24, 'default': 0, 'description': '最早出发时间（0-24），默认为0。'}, 'latestStartTime': {'type': 'number', 'minimum': 0, 'maximum': 24, 'default': 24, 'description': '最迟出发时间（0-24），默认为24。'}, 'sortFlag': {'type': 'string', 'default': '', 'description': '排序方式，默认为空，即不排序。仅支持单一标识。可选标志：[startTime(出发时间从早到晚), arriveTime(抵达时间从早到晚), duration(历时从短到长)]'}, 'sortReverse': {'type': 'boolean', 'default': False, 'description': '是否逆向排序结果，默认为false。仅在设置了sortFlag时生效。'}, 'limitedNum': {'type': 'number', 'minimum': 0, 'default': 0, 'description': '返回的余票数量限制，默认为0，即不限制。'}, 'format': {'type': 'string', 'pattern': '^(text|csv|json)$', 'default': 'text', 'description': '返回结果格式，默认为text，建议使用text与csv。可选标志：[text, csv, json]'}}, 'required': ['date', 'fromStation', 'toStation'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-interline-tickets', 'title': None, 'description': '查询12306中转余票信息。尚且只支持查询前十条。', 'inputSchema': {'type': 'object', 'properties': {'date': {'type': 'string', 'minLength': 10, 'maxLength': 10, 'description': '查询日期，格式为 "yyyy-MM-dd"。如果用户提供的是相对日期（如“明天”），请务必先调用 `get-current-date` 接口获取当前日期，并计算出目标日期。'}, 'fromStation': {'type': 'string', 'description': '出发地的 `station_code` 。必须是通过 `get-station-code-by-names` 或 `get-station-code-of-citys` 接口查询得到的编码，严禁直接使用中文地名。'}, 'toStation': {'type': 'string', 'description': '出发地的 `station_code` 。必须是通过 `get-station-code-by-names` 或 `get-station-code-of-citys` 接口查询得到的编码，严禁直接使用中文地名。'}, 'middleStation': {'type': 'string', 'default': '', 'description': '中转地的 `station_code` ，可选。必须是通过 `get-station-code-by-names` 或 `get-station-code-of-citys` 接口查询得到的编码，严禁直接使用中文地名。'}, 'showWZ': {'type': 'boolean', 'default': False, 'description': '是否显示无座车，默认不显示无座车。'}, 'trainFilterFlags': {'type': 'string', 'pattern': '^[GDZTKOFS]*$', 'maxLength': 8, 'default': '', 'description': '车次筛选条件，默认为空。从以下标志中选取多个条件组合[G(高铁/城际),D(动车),Z(直达特快),T(特快),K(快速),O(其他),F(复兴号),S(智能动车组)]'}, 'earliestStartTime': {'type': 'number', 'minimum': 0, 'maximum': 24, 'default': 0, 'description': '最早出发时间（0-24），默认为0。'}, 'latestStartTime': {'type': 'number', 'minimum': 0, 'maximum': 24, 'default': 24, 'description': '最迟出发时间（0-24），默认为24。'}, 'sortFlag': {'type': 'string', 'default': '', 'description': '排序方式，默认为空，即不排序。仅支持单一标识。可选标志：[startTime(出发时间从早到晚), arriveTime(抵达时间从早到晚), duration(历时从短到长)]'}, 'sortReverse': {'type': 'boolean', 'default': False, 'description': '是否逆向排序结果，默认为false。仅在设置了sortFlag时生效。'}, 'limitedNum': {'type': 'number', 'minimum': 1, 'default': 10, 'description': '返回的中转余票数量限制，默认为10。'}, 'format': {'type': 'string', 'pattern': '^(text|json)$', 'default': 'text', 'description': '返回结果格式，默认为text，建议使用text。可选标志：[text, json]'}}, 'required': ['date', 'fromStation', 'toStation'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}, {'name': 'get-train-route-stations', 'title': None, 'description': '查询特定列车车次在指定区间内的途径车站、到站时间、出发时间及停留时间等详细经停信息。当用户询问某趟具体列车的经停站时使用此接口。', 'inputSchema': {'type': 'object', 'properties': {'trainCode': {'type': 'string', 'description': '要查询的车次 `train_code`，例如"G1033"。'}, 'departDate': {'type': 'string', 'minLength': 10, 'maxLength': 10, 'description': '列车出发的日期 (格式: yyyy-MM-dd)。如果用户提供的是相对日期，请务必先调用 `get-current-date` 解析。'}, 'format': {'type': 'string', 'pattern': '^(text|json)$', 'default': 'text', 'description': '返回结果格式，默认为text，建议使用text。可选标志：[text, json]'}}, 'required': ['trainCode', 'departDate'], 'additionalProperties': False, '$schema': 'http://json-schema.org/draft-07/schema#'}, 'outputSchema': None, 'annotations': None, 'meta': None, 'execution': {'taskSupport': 'forbidden'}}]}
# tools {'meta': None, 'nextCursor': None, 'tools': [{'name': 'createEvent', 'title': None, 'description': '创建一个新的日程，支持设置时间、地点、参与者、提醒、重复规则等', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程创建者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary，表示用户的主日历'}, 'summary': {'type': 'string', 'description': '日程标题，最大不超过2048个字符'}, 'description': {'type': 'string', 'description': '日程描述，最大不超过5000个字符'}, 'start': {'type': 'object', 'description': '日程开始时间对象。非全天日程格式示例：{"dateTime":"2025-09-20T10:15:30+08:00","timeZone":"Asia/Shanghai"}；全天日程格式：{"date":"2025-09-20"}'}, 'end': {'type': 'object', 'description': '日程结束时间对象。非全天日程格式示例：{"dateTime":"2025-09-20T11:15:30+08:00","timeZone":"Asia/Shanghai"}；全天日程格式：{"date":"2025-09-21"}（全天日程结束日期需要+1天）'}, 'isAllDay': {'type': 'boolean', 'description': '是否全天日程'}, 'location': {'type': 'object', 'description': '日程地点对象，包含displayName字段。示例：{"displayName":"会议室A"}'}, 'attendees': {'type': 'array', 'description': '日程参与人列表，最多支持500个参与人。数组中每个对象包含id（用户unionId）和isOptional（是否可选参与人）字段。示例：[{"id":"unionId123","isOptional":false}]'}, 'reminders': {'type': 'array', 'description': '日程提醒设置，数组中每个对象包含method和minutes字段。如不传默认开始前15分钟提醒，传空数组表示不设提醒。method只支持"dingtalk"（钉钉内提醒），minutes为Integer类型表示提前N分钟提醒。示例：[{"method":"dingtalk","minutes":15}]'}, 'recurrence': {'type': 'object', 'description': '日程循环规则对象'}, 'onlineMeetingInfo': {'type': 'object', 'description': '创建日程同时创建线上会议。对象包含type字段，目前只支持"dingtalk"（钉钉视频会议）。示例：{"type":"dingtalk"}'}, 'extra': {'type': 'object', 'description': '扩展配置，如noPushNotification、noChatNotification等。示例：{"noPushNotification":"true","noChatNotification":"false"}'}, 'uiConfigs': {'type': 'array', 'description': 'UI配置，控制日程详情页内组件的展示'}, 'richTextDescription': {'type': 'object', 'description': '富文本描述对象'}}, 'required': ['unionId', 'calendarId', 'summary', 'start']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'updateEvent', 'title': None, 'description': '修改已存在的日程信息', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程组织者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'eventId': {'type': 'string', 'description': '要修改的日程ID'}, 'id': {'type': 'string', 'description': '要修改的日程ID，和eventId参数的值一样。'}, 'summary': {'type': 'string', 'description': '日程标题'}, 'description': {'type': 'string', 'description': '日程描述'}, 'start': {'type': 'object', 'description': '日程开始时间对象。非全天日程格式：{"dateTime":"2021-09-20T10:15:30+08:00","timeZone":"Asia/Shanghai"}；全天日程格式：{"date":"2021-09-20"}'}, 'end': {'type': 'object', 'description': '日程结束时间对象。非全天日程格式：{"dateTime":"2021-09-20T11:15:30+08:00","timeZone":"Asia/Shanghai"}；全天日程格式：{"date":"2021-09-21"}（全天日程结束日期需要+1天）'}, 'isAllDay': {'type': 'boolean', 'description': '是否全天日程'}, 'location': {'type': 'object', 'description': '日程地点对象', 'properties': {'displayName': {'type': 'string', 'description': '日程地点的名称。'}}}}, 'required': ['unionId', 'calendarId', 'eventId', 'id']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'deleteEvent', 'title': None, 'description': '删除指定的日程', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程组织者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'eventId': {'type': 'string', 'description': '要删除的日程ID'}, 'pushNotification': {'type': 'boolean', 'description': '是否发送弹窗提醒'}}, 'required': ['unionId', 'calendarId', 'eventId']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getEvent', 'title': None, 'description': '查询单个日程的详细信息', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程组织者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'eventId': {'type': 'string', 'description': '要查询的日程ID'}, 'maxAttendees': {'type': 'number', 'description': '返回的参与者列表的最大数量'}}, 'required': ['unionId', 'calendarId', 'eventId']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'addAttendee', 'title': None, 'description': '添加日程参与者，每次最多支持操作500人', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程创建者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'eventId': {'type': 'string', 'description': '日程ID'}, 'attendeesToAdd': {'type': 'array', 'description': '需要添加的参与人列表，数组中每个对象包含id（用户unionId）和isOptional（是否可选参与人）字段。示例：[{"id":"unionId123","isOptional":false}]'}, 'pushNotification': {'type': 'boolean', 'description': '是否弹窗提醒'}, 'chatNotification': {'type': 'boolean', 'description': '是否单聊提醒'}}, 'required': ['unionId', 'calendarId', 'eventId', 'attendeesToAdd']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'removeAttendee', 'title': None, 'description': '删除日程参与者，每次最多支持操作500人', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程创建者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'eventId': {'type': 'string', 'description': '日程ID'}, 'attendeesToRemove': {'type': 'array', 'description': '需要删除的参与人列表，数组中每个对象包含id（用户unionId）字段。示例：[{"id":"unionId123"}]'}, 'pushNotification': {'type': 'boolean', 'description': '是否弹窗提醒'}, 'chatNotification': {'type': 'boolean', 'description': '是否单聊提醒'}}, 'required': ['unionId', 'calendarId', 'eventId', 'attendeesToRemove']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getAttendees', 'title': None, 'description': '获取日程参与者列表', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '日程创建者的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'eventId': {'type': 'string', 'description': '日程ID'}, 'maxResults': {'type': 'number', 'description': '最大返回数量，默认100，最大500'}, 'nextToken': {'type': 'string', 'description': '分页标记'}}, 'required': ['unionId', 'calendarId', 'eventId']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getCalendarView', 'title': None, 'description': '查询日程视图，按时间范围获取日程列表', 'inputSchema': {'type': 'object', 'properties': {'unionId': {'type': 'string', 'description': '用户的unionId'}, 'calendarId': {'type': 'string', 'description': '日程所属的日历ID，统一为primary'}, 'timeMin': {'type': 'string', 'description': '查询的起始时间，格式为ISO-8601的date-time格式。'}, 'timeMax': {'type': 'string', 'description': '查询的结束时间，格式为ISO-8601的date-time格式。'}, 'maxAttendees': {'type': 'number', 'description': '返回的参与者列表的最大数量'}, 'maxResults': {'type': 'number', 'description': '最大返回数量'}, 'nextToken': {'type': 'string', 'description': '分页标记'}}, 'required': ['unionId', 'calendarId', 'timeMin', 'timeMax']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'currentDateTime', 'title': None, 'description': '获取当前日期和时间', 'inputSchema': {'type': 'object', 'properties': {}, 'required': []}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'searchUser', 'title': None, 'description': '根据姓名搜索钉钉通讯录用户的userId。', 'inputSchema': {'type': 'object', 'properties': {'queryWord': {'type': 'string', 'description': '搜索关键词，可以是用户姓名、姓名拼音或英文名称。'}, 'offset': {'type': 'number', 'description': '分页偏移量，从0开始'}, 'size': {'type': 'number', 'description': '分页大小，最大50'}, 'fullMatchField': {'type': 'number', 'description': '是否精确匹配，1：精确匹配用户名称。'}}, 'required': ['queryWord']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getUserDetailByUserId', 'title': None, 'description': '查询用户详情 - 根据userId获取用户的详细信息，包含用户的unionId。', 'inputSchema': {'type': 'object', 'properties': {'userid': {'type': 'string', 'description': '用户的userId。'}, 'language': {'type': 'string', 'description': '语言。 * **zh_CN** ：中文（默认值） * **en_US** ：英文'}}, 'required': ['userid']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getUserIdByMobile', 'title': None, 'description': '根据手机号获取用户的userId。', 'inputSchema': {'type': 'object', 'properties': {'mobile': {'type': 'string', 'description': '手机号'}}, 'required': ['mobile']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getUserIdByUnionId', 'title': None, 'description': '根据unionId获取用户的userId。', 'inputSchema': {'type': 'object', 'properties': {'unionid': {'type': 'string', 'description': 'unionId,员工在当前开发者企业账号范围内的唯一标识'}}, 'required': ['unionid']}, 'outputSchema': None, 'annotations': None, 'meta': None}, {'name': 'getDepartmentUsersByDepId', 'title': None, 'description': '获取指定部门下的所有成员的userId。', 'inputSchema': {'type': 'object', 'properties': {'dept_id': {'type': 'number', 'description': '部门ID'}}, 'required': ['dept_id']}, 'outputSchema': None, 'annotations': None, 'meta': None}]}
mcp_config = MCPConfig(
    mcpServers={
        # "dingtalk-mcp": {
        #     "args": [
        #         "-y",
        #         "dingtalk-mcp@latest"
        #     ],
        #     "command": "npx",
        #     "env": {
        #         "ACTIVE_PROFILES": "dingtalk-contacts,dingtalk-calendar",
        #         "DINGTALK_Client_ID": "your dingtalk client id",
        #         "DINGTALK_Client_Secret": "your dingtalk client secret"
        #     }
        # }
        # '12306-mcp': {'args': ['-y', '12306-mcp'], 'command': 'npx'}
        # 'amap-maps-streamableHTTP': {
        #     # "type": "streamable_http",
        #     # "type": "sse",
        #     # 'url': 'https://mcp.amap.com/mcp?key=您在高德官网上申请的key'
        #     'url': 'https://mcp.api-inference.modelscope.net/8edf6ad11e724f/mcp'
        # },
        'bing-cn-mcp-server': {
            # "type": "streamable_http",
            'url': 'https://mcp.api-inference.modelscope.net/5713e828be174e/mcp'
        }
        # "amap-maps": {
        #     "type": "streamable_http",
        #     "url": "https://mcp.api-inference.modelscope.net/d1f3517751d743/mcp"
        # }
        # 'wuying-agentbay-mcp-server': {
        #     'args': ['-y', 'wuying-agentbay-mcp-server'],
        #     'command': 'npx',
        #     'env': {'APIKEY': 'APIKEY'},
        # },
        # "amap-maps": {
        #     "args": [
        #         "-y",
        #         "@amap/amap-maps-mcp-server"
        #     ],
        #     "command": "npx",
        #     "env": {
        #         "AMAP_MAPS_API_KEY": "xx"
        #     }
        # },
        # "amap-maps": {
        #     "args": [
        #         "-y",
        #         "@amap/amap-maps-mcp-server"
        #     ],
        #     "command": "npx",
        #     "env": {
        #         "AMAP_MAPS_API_KEY": "AMAP_MAPS_API_KEY"
        #     }
        # },
        # "bing-search": {
        #     "args": [
        #         "-y",
        #         "bing-cn-mcp"
        #     ],
        #     "command": "npx"
        # }
    }
)

print('config', mcp_config)
print('servers', mcp_config.mcpServers)
client = Client(mcp_config)


async def main():
    async with client:
        # Basic server interaction
        await client.ping()

        result = client.initialize_result
        print('result', result.model_dump_json())

        capabilities = result.capabilities

        # List available operations
        if capabilities.tools:
            tools = await client.list_tools_mcp()
            print('tools', tools.model_dump(mode='json'))

        if capabilities.resources:
            resources = await client.list_resources_mcp()
            print('resources', resources.model_dump_json())

        if capabilities.prompts:
            prompts = await client.list_prompts_mcp()
            print('prompts', prompts.model_dump())

        # Execute operations
        # result = await client.call_tool("example_tool", {"param": "value"})
        # print(result)


asyncio.run(main())
