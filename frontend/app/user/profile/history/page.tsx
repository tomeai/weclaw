"use client"

import ProfileLayout from "@/components/layout/profile-layout"
import { ProfileSidebar } from "@/components/sidebar/profile-sidebar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Search,
  Server,
  XCircle,
  Zap,
} from "lucide-react"
import { useState } from "react"

export default function ProfileHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("7d")

  // 模拟使用记录数据
  const usageRecords = [
    {
      id: "1",
      timestamp: "2024-01-20 14:30:25",
      mcpName: "Code Interpreter",
      operation: "代码执行",
      status: "success",
      duration: "2.3s",
      tokens: 1250,
      cost: "$0.012",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      requestId: "req_1234567890",
    },
    {
      id: "2",
      timestamp: "2024-01-20 14:25:18",
      mcpName: "File System",
      operation: "文件读取",
      status: "success",
      duration: "0.8s",
      tokens: 320,
      cost: "$0.003",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      requestId: "req_1234567889",
    },
    {
      id: "3",
      timestamp: "2024-01-20 14:20:42",
      mcpName: "Database Query",
      operation: "数据查询",
      status: "error",
      duration: "5.1s",
      tokens: 0,
      cost: "$0.000",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      requestId: "req_1234567888",
      error: "Connection timeout",
    },
    {
      id: "4",
      timestamp: "2024-01-20 14:15:33",
      mcpName: "Web Scraper",
      operation: "网页抓取",
      status: "warning",
      duration: "12.5s",
      tokens: 2800,
      cost: "$0.028",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      requestId: "req_1234567887",
    },
    {
      id: "5",
      timestamp: "2024-01-20 14:10:15",
      mcpName: "Code Interpreter",
      operation: "代码解释",
      status: "success",
      duration: "1.2s",
      tokens: 680,
      cost: "$0.007",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      requestId: "req_1234567886",
    },
  ]

  const filteredRecords = usageRecords.filter((record) => {
    const matchesSearch =
      record.mcpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.requestId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">成功</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">失败</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">警告</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const totalCost = filteredRecords
    .reduce((sum, record) => sum + parseFloat(record.cost.replace("$", "")), 0)
    .toFixed(3)

  const totalTokens = filteredRecords.reduce(
    (sum, record) => sum + record.tokens,
    0
  )

  return (
    <ProfileLayout sidebar={<ProfileSidebar />}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">使用记录</h1>
          <p className="text-muted-foreground">查看您的API调用历史和使用统计</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{filteredRecords.length}</p>
                  <p className="text-muted-foreground text-sm">总调用次数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {totalTokens.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">总Token数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">${totalCost}</p>
                  <p className="text-muted-foreground text-sm">总费用</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      filteredRecords.filter((r) => r.status === "success")
                        .length
                    }
                  </p>
                  <p className="text-muted-foreground text-sm">成功次数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="搜索MCP名称、操作或请求ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="error">失败</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今天</SelectItem>
              <SelectItem value="7d">7天</SelectItem>
              <SelectItem value="30d">30天</SelectItem>
              <SelectItem value="90d">90天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出记录
          </Button>
        </div>

        {/* 详细记录表格 */}
        <Card>
          <CardHeader>
            <CardTitle>详细记录</CardTitle>
            <CardDescription>
              显示最近的API调用记录，包含详细信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>MCP名称</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>费用</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <Activity className="text-muted-foreground h-8 w-8" />
                          <p className="text-muted-foreground">
                            {searchTerm ? "没有找到匹配的记录" : "暂无使用记录"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm">{record.timestamp}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.mcpName}
                        </TableCell>
                        <TableCell>{record.operation}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            {getStatusBadge(record.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <span>{record.duration}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.tokens.toLocaleString()}</TableCell>
                        <TableCell className="font-mono">
                          {record.cost}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}
