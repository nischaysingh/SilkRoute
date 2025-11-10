
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Package, ShoppingCart, Users, Plus, Edit, Eye, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Search, Filter, Download, X,
  RefreshCw, Truck, BoxIcon, Mail, Phone, MapPin, Calendar, Settings,
  Sparkles, AlertTriangle, Copy, Printer, Tag, ArrowRight, ChevronRight,
  FileText, Zap, Ship, PackageCheck, PackageX, CircleDot, MoreHorizontal,
  MessageSquare, Bot, ChevronDown, ChevronUp, Weight, Ruler, Box, Send,
  Target, Activity, DollarSign, Gauge, Layers, BarChart3,
  Wifi, WifiOff, Play, Pause, BarChart2, PieChart, Info, Lightbulb, Brain,
  History, Radio, Cpu, GitBranch, Rocket, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, addDays, differenceInHours, differenceInMinutes, getHours, getDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart, Line, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  Cell, ComposedChart, Brush
} from "recharts";
import InventoryManagement from "../components/InventoryManagement";
import CustomerManagement from "../components/CustomerManagement";

// Mock Data Generator
const generateMockOrders = () => {
  const channels = ['Shopify', 'Amazon', 'POS', 'Manual'];
  const statuses = ['pending', 'processing', 'picking', 'packed', 'partially_shipped', 'shipped', 'delivered', 'canceled', 'exception'];
  const stages = ['created', 'allocated', 'batched', 'picked', 'packed', 'shipped'];
  const paymentStatuses = ['authorized', 'captured', 'failed', 'hold'];
  const warehouses = ['WH-A', 'WH-B', 'WH-C'];
  const carriers = ['UPS', 'FedEx', 'USPS', 'DHL'];
  const skus = ['SKU-001', 'SKU-002', 'SKU-003', 'SKU-004', 'SKU-005', 'SKU-101', 'SKU-202'];
  const customers = [
  { name: 'John Smith', email: 'john@example.com', ltv: 2400, segment: 'VIP', isVIP: true },
  { name: 'Sarah Johnson', email: 'sarah@example.com', ltv: 890, segment: 'Regular', isVIP: false },
  { name: 'Mike Brown', email: 'mike@example.com', ltv: 3200, segment: 'VIP', isVIP: true },
  { name: 'Emily Davis', email: 'emily@example.com', ltv: 450, segment: 'New', isVIP: false },
  { name: 'James Wilson', email: 'james@example.com', ltv: 1800, segment: 'Regular', isVIP: false }];


  const orders = [];
  const now = new Date();

  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = subDays(now, daysAgo);
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const statusRand = Math.random();

    let status = 'delivered';
    if (statusRand > 0.6) status = statuses[Math.floor(Math.random() * 5)];else
    if (statusRand > 0.4) status = 'shipped';else
    if (statusRand > 0.15) status = 'delivered';else
    if (statusRand > 0.1) status = 'exception';else
    status = 'canceled';

    const stage = stages[Math.floor(Math.random() * stages.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];

    const items = Array.from({ length: itemCount }, (_, idx) => {
      const qtyOrdered = Math.floor(Math.random() * 5) + 1;
      const qtyAllocated = status === 'pending' ? 0 : Math.random() > 0.1 ? qtyOrdered : Math.floor(qtyOrdered * 0.7);
      const qtyPicked = ['picking', 'packed', 'shipped', 'delivered'].includes(status) ? qtyAllocated : 0;
      const qtyPacked = ['packed', 'shipped', 'delivered'].includes(status) ? qtyPicked : 0;
      const qtyShipped = ['shipped', 'delivered'].includes(status) ? qtyPacked : 0;

      return {
        sku: skus[Math.floor(Math.random() * skus.length)],
        name: `Product ${idx + 1}`,
        variant: Math.random() > 0.5 ? 'Blue / Medium' : null,
        qtyOrdered,
        qtyAllocated,
        qtyPicked,
        qtyPacked,
        qtyShipped,
        unitPrice: Math.floor(Math.random() * 100) + 20
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qtyOrdered, 0);
    const discount = Math.floor(subtotal * 0.1);
    const shipping = Math.floor(Math.random() * 20) + 5;
    const tax = Math.floor(subtotal * 0.08);
    const total = subtotal - discount + shipping + tax;

    const promisedShipBy = addDays(createdAt, Math.floor(Math.random() * 3) + 1);
    const promisedDeliverBy = addDays(promisedShipBy, Math.floor(Math.random() * 5) + 2);
    const timeLeft = differenceInHours(promisedShipBy, now);
    const risk = timeLeft < 6 ? 'high' : timeLeft < 12 ? 'med' : 'low';

    const hasBackorder = items.some((item) => item.qtyAllocated < item.qtyOrdered);
    const fraudFlag = Math.random() > 0.98;
    const addressFlag = Math.random() > 0.97;
    const taxFlag = Math.random() > 0.99;

    const pickedAt = status !== 'pending' && Math.random() > 0.2 ? addDays(createdAt, Math.random() * 0.5) : null;
    const shippedAt = ['shipped', 'delivered'].includes(status) ? addDays(createdAt, 1 + Math.random() * 2) : null;
    const deliveredAt = status === 'delivered' ? addDays(createdAt, 3 + Math.random() * 3) : null;

    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];

    const transitDays = deliveredAt && shippedAt ? Math.floor((new Date(deliveredAt) - new Date(shippedAt)) / (1000 * 60 * 60 * 24)) : Math.floor(Math.random() * 5) + 1;
    const onTime = transitDays <= 3; // Example: on-time if delivered within 3 days of shipping

    const orderTimeline = [
    { event: 'Order Created', timestamp: createdAt.toISOString(), icon: 'ShoppingCart' },
    ...(status !== 'pending' ? [{ event: 'Payment Authorized', timestamp: addDays(createdAt, 0.1).toISOString(), icon: 'CheckCircle' }] : []),
    ...(status === 'picking' || status === 'packed' || status === 'shipped' || status === 'delivered' ? [{ event: 'Picking Started', timestamp: addDays(createdAt, 0.5).toISOString(), icon: 'Package' }] : []),
    ...(status === 'packed' || status === 'shipped' || status === 'delivered' ? [{ event: 'Order Packed', timestamp: addDays(createdAt, 1).toISOString(), icon: 'Box' }] : []),
    ...(status === 'shipped' || status === 'delivered' ? [{ event: 'Shipped', timestamp: addDays(createdAt, 1.5).toISOString(), icon: 'Ship' }] : []),
    ...(status === 'delivered' ? [{ event: 'Delivered', timestamp: addDays(createdAt, 3).toISOString(), icon: 'PackageCheck' }] : []),
    ...(status === 'canceled' ? [{ event: 'Order Canceled', timestamp: addDays(createdAt, 0.5).toISOString(), icon: 'PackageX' }] : []),
    ...(status === 'exception' ? [{ event: 'Exception Detected', timestamp: addDays(createdAt, 0.5).toISOString(), icon: 'AlertTriangle' }] : [])].
    sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());


    orders.push({
      id: `ORD-${10000 + i}`,
      orderNo: `#${10000 + i}`,
      channel,
      createdAt: createdAt.toISOString(),
      customer,
      currency: 'USD',
      items,
      totals: { subtotal, discount, shipping, tax, total },
      payment: {
        status: status === 'exception' && Math.random() > 0.5 ? 'failed' :
        Math.random() > 0.9 ? 'hold' :
        status === 'pending' ? 'authorized' : 'captured'
      },
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US'
      },
      billingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US'
      },
      warehouse,
      carrier,
      tracking: status === 'shipped' || status === 'delivered' ? [`1Z${Math.random().toString(36).substr(2, 9).toUpperCase()}`] : [],
      status,
      stage,
      sla: {
        promisedShipBy,
        promisedDeliverBy,
        risk,
        timeLeft: Math.max(0, timeLeft),
        onTime
      },
      flags: {
        fraud: fraudFlag,
        address: addressFlag,
        tax: taxFlag,
        backorder: hasBackorder
      },
      tags: Math.random() > 0.7 ? ['Priority'] : [],
      notes: [],
      exception: status === 'exception' ? {
        type: ['stockout', 'addressError', 'paymentHold', 'carrierDelay'][Math.floor(Math.random() * 4)],
        severity: 'high',
        message: 'Requires attention',
        suggestedFix: 'Reroute to alternate warehouse'
      } : null,
      timestamps: {
        created: createdAt.toISOString(),
        picked: pickedAt?.toISOString(),
        shipped: shippedAt?.toISOString(),
        delivered: deliveredAt?.toISOString()
      },
      transitDays,
      isVIP: customer.isVIP,
      fulfillmentLeadTime: pickedAt ? differenceInHours(pickedAt, createdAt) : differenceInHours(now, createdAt),
      timeline: orderTimeline
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export default function Management() {
  const [activeTab, setActiveTab] = useState("orders");
  const [mockOrders, setMockOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("30D");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [metricsDrawerOpen, setMetricsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  // selectedInventory and inventoryDetailOpen moved to InventoryManagement component
  const [filters, setFilters] = useState({
    status: [],
    channel: [],
    payment: [],
    warehouse: [],
    carrier: [],
    risk: [],
    flags: [],
    stage: null
  });
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [explainViewOpen, setExplainViewOpen] = useState(false); // Renamed from explainSpikeOpen
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false); // Original modal, replaced by floating
  const [automationRulesOpen, setAutomationRulesOpen] = useState(false);
  const [slaFloatingOpen, setSlaFloatingOpen] = useState(false);
  const [hoveredAtRiskOrder, setHoveredAtRiskOrder] = useState(null);
  const [aiTypingText, setAiTypingText] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSync, setLastSync] = useState(new Date());
  const [copilotVisible, setCopilotVisible] = useState(false);
  const [appliedActions, setAppliedActions] = useState([]);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  // Automation rules state
  const [automationRules, setAutomationRules] = useState({
    autoAllocate: true,
    autoUpgradeSLA: false,
    autoCombineOrders: true,
    autoNotifyFinance: true
  });

  const [cartons, setCartons] = useState([]);
  const [newCarton, setNewCarton] = useState({ weight: '', length: '', width: '', height: '' });


  const queryClient = useQueryClient();

  // Fetch Inventory (This was moved to InventoryManagement component)


  // Initialize mock data
  useEffect(() => {
    setMockOrders(generateMockOrders());
    setLastSync(new Date());
  }, []);

  // Auto-update simulation every 30 seconds
  useEffect(() => {
    if (!autoUpdateEnabled) return;

    const interval = setInterval(() => {
      setLastSync(new Date());
      // Simulate minor data changes
      setMockOrders((prev) => {
        const updated = [...prev];
        // Randomly update 1-2 orders
        for (let i = 0; i < Math.min(2, updated.length); i++) {
          const idx = Math.floor(Math.random() * updated.length);
          if (updated[idx] && updated[idx].status === 'processing') {
            updated[idx] = { ...updated[idx], status: 'picking' };
          }
        }
        return updated;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [autoUpdateEnabled]);

  // Update current time every minute for SLA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = mockOrders || [];

    const now = new Date();
    if (timeRange === 'Today') {
      result = result.filter((o) => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));
    } else if (timeRange === '7D') {
      result = result.filter((o) => new Date(o.createdAt) >= subDays(now, 7));
    } else if (timeRange === '30D') {
      result = result.filter((o) => new Date(o.createdAt) >= subDays(now, 30));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((o) =>
      o.orderNo?.toLowerCase().includes(query) ||
      o.customer?.name?.toLowerCase().includes(query) ||
      o.customer?.email?.toLowerCase().includes(query) ||
      o.items?.some((item) => item.sku?.toLowerCase().includes(query))
      );
    }

    if (filters.status?.length > 0) {
      result = result.filter((o) => filters.status.includes(o.status));
    }

    if (filters.channel?.length > 0) {
      result = result.filter((o) => filters.channel.includes(o.channel));
    }

    if (filters.payment?.length > 0) {
      result = result.filter((o) => filters.payment.includes(o.payment?.status));
    }

    if (filters.stage) {
      result = result.filter((o) => o.stage === filters.stage);
    }

    return result;
  }, [mockOrders, searchQuery, timeRange, filters]);

  // Get unique customers from orders
  const customers = useMemo(() => {
    if (!mockOrders || mockOrders.length === 0) return [];

    const customerMap = new Map();
    mockOrders.forEach((order) => {
      if (order.customer?.email) {
        if (!customerMap.has(order.customer.email)) {
          customerMap.set(order.customer.email, {
            name: order.customer.name,
            email: order.customer.email,
            orders: [],
            totalSpent: 0,
            ltv: order.customer.ltv,
            segment: order.customer.segment
          });
        }
        const customer = customerMap.get(order.customer.email);
        customer.orders.push(order);
        customer.totalSpent += order.totals?.total || 0;
      }
    });
    return Array.from(customerMap.values());
  }, [mockOrders]);

  // METRICS CALCULATIONS
  const metrics = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return {
        ordersInflow: 0,
        onTimeShipRate: 0,
        slaRiskPct: 0,
        exceptionRate: 0,
        p50LeadTime: 0,
        p90LeadTime: 0,
        fillRate: 0,
        paymentCaptureRate: 0,
        avgCostToServe: 12.50,
        atRiskCount: 0
      };
    }

    const now = new Date();
    const today = filteredOrders.filter((o) => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));

    // On-Time Ship Rate
    const shippedOrders = filteredOrders.filter((o) => o.timestamps?.shipped);
    const onTimeShipped = shippedOrders.filter((o) => o.sla?.onTime).length;
    const onTimeShipRate = shippedOrders.length > 0 ? onTimeShipped / shippedOrders.length * 100 : 0;

    // SLA Risk %
    const openOrders = filteredOrders.filter((o) => !['delivered', 'canceled'].includes(o.status));
    const atRiskOrders = openOrders.filter((o) => o.sla?.timeLeft < 24).length;
    const slaRiskPct = openOrders.length > 0 ? atRiskOrders / openOrders.length * 100 : 0;

    // Exception Rate
    const exceptionsToday = today.filter((o) => o.exception).length;
    const exceptionRate = today.length > 0 ? exceptionsToday / today.length * 100 : 0;

    // Lead Times
    const leadTimes = filteredOrders.
    map((o) => o.fulfillmentLeadTime).
    filter((t) => t != null).
    sort((a, b) => a - b);
    const p50LeadTime = leadTimes[Math.floor(leadTimes.length * 0.5)] || 0;
    const p90LeadTime = leadTimes[Math.floor(leadTimes.length * 0.9)] || 0;

    // Fill Rate
    const totalOrdered = filteredOrders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.qtyOrdered || 0), 0) || 0), 0);
    const totalAllocated = filteredOrders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.qtyAllocated || 0), 0) || 0), 0);
    const fillRate = totalOrdered > 0 ? totalAllocated / totalOrdered * 100 : 0;

    // Payment Capture Rate
    const capturedPayments = filteredOrders.filter((o) => o.payment?.status === 'captured').length;
    const paymentCaptureRate = filteredOrders.length > 0 ? capturedPayments / filteredOrders.length * 100 : 0;

    // Cost to Serve (mock)
    const avgCostToServe = 12.50;

    return {
      ordersInflow: today.length,
      onTimeShipRate,
      slaRiskPct,
      exceptionRate,
      p50LeadTime,
      p90LeadTime,
      fillRate,
      paymentCaptureRate,
      avgCostToServe,
      atRiskCount: atRiskOrders
    };
  }, [filteredOrders]);

  // Calculate KPIs (Existing Kpis, kept below the new metrics section)
  const kpis = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return {
        today: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        pending: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        processing: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        packed: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        shipped: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        delivered: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        atRisk: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        backorders: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
        rmas: { value: 0, change: 0, trend: [0, 0, 0, 0, 0, 0, 0] }
      };
    }

    const now = new Date();
    const today = filteredOrders.filter((o) => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'));

    return {
      today: { value: today.length, change: 12, trend: [5, 8, 6, 12, 10, 15, today.length] },
      pending: { value: filteredOrders.filter((o) => o.status === 'pending').length, change: -5, trend: [12, 10, 8, 9, 7, 6, filteredOrders.filter((o) => o.status === 'pending').length] },
      processing: { value: filteredOrders.filter((o) => o.status === 'processing').length, change: 8, trend: [8, 10, 12, 11, 10, 12, filteredOrders.filter((o) => o.status === 'processing').length] },
      packed: { value: filteredOrders.filter((o) => o.status === 'packed').length, change: 3, trend: [5, 6, 7, 8, 7, 8, filteredOrders.filter((o) => o.status === 'packed').length] },
      shipped: { value: filteredOrders.filter((o) => o.status === 'shipped').length, change: 15, trend: [20, 22, 25, 23, 28, 30, filteredOrders.filter((o) => o.status === 'shipped').length] },
      delivered: { value: filteredOrders.filter((o) => o.status === 'delivered').length, change: 18, trend: [40, 45, 50, 48, 52, 55, filteredOrders.filter((o) => o.status === 'delivered').length] },
      atRisk: { value: filteredOrders.filter((o) => o.sla?.risk === 'high').length, change: -10, trend: [8, 7, 6, 5, 4, 3, filteredOrders.filter((o) => o.sla?.risk === 'high').length] },
      backorders: { value: filteredOrders.filter((o) => o.flags?.backorder).length, change: -8, trend: [12, 11, 10, 9, 8, 7, filteredOrders.filter((o) => o.flags?.backorder).length] },
      rmas: { value: Math.floor(filteredOrders.length * 0.02), change: -3, trend: [5, 4, 4, 3, 3, 2, Math.floor(filteredOrders.length * 0.02)] }
    };
  }, [filteredOrders]);

  // Typewriter effect for AI explanations
  const explainViewText = useMemo(() => {
    return `🧠 **AI Analysis: Current Operations State**

📊 **Volume & Flow**
You're viewing ${filteredOrders.length} orders across ${timeRange}. Current inflow is ${metrics.ordersInflow} orders today, tracking ${kpis.today.change > 0 ? 'above' : 'below'} baseline by ${Math.abs(kpis.today.change)}%.

⚡ **Performance Snapshot**
On-Time Ship Rate is ${metrics.onTimeShipRate.toFixed(1)}% (target: 95%). ${metrics.slaRiskPct > 15 ? `⚠️ ${metrics.atRiskCount} orders are at high SLA risk - immediate action recommended.` : '✅ SLA risk is manageable.'}

🎯 **Operational Health**
- Lead Time: p50 ${metrics.p50LeadTime}h, p90 ${metrics.p90LeadTime}h
- Fill Rate: ${metrics.fillRate.toFixed(1)}% (${(100 - metrics.fillRate).toFixed(1)}% backorder impact)
- Payment Capture: ${metrics.paymentCaptureRate.toFixed(1)}%
- Exception Rate: ${metrics.exceptionRate.toFixed(1)}% ${metrics.exceptionRate > 5 ? '(elevated - investigate root cause)' : '(normal)'}

🚀 **AI Recommendations**
${metrics.slaRiskPct > 15 ? '1. Enable auto-upgrade for high-risk orders\n2. Consider rerouting from congested warehouses' : '1. Current automation rules are effective\n2. Monitor for demand spikes in next 24h'}

💡 **Cost Efficiency**
Average cost to serve: $${metrics.avgCostToServe.toFixed(2)}/order. Automation has saved an estimated $${(appliedActions.length * 3.5).toFixed(2)} this session through batch optimization and smart routing.`;
  }, [filteredOrders, metrics, kpis, timeRange, appliedActions]);


  useEffect(() => {
    if (explainViewOpen && aiTypingText.length < explainViewText.length) {
      const timeout = setTimeout(() => {
        setAiTypingText(explainViewText.slice(0, aiTypingText.length + 2));
      }, 15); // Faster typing speed
      return () => clearTimeout(timeout);
    }
  }, [explainViewOpen, aiTypingText, explainViewText]);

  // Throughput Trend Data
  const throughputTrend = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayOrders = filteredOrders.filter((o) =>
      format(new Date(o.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      return {
        date: format(date, 'MMM d'),
        created: dayOrders.length,
        picked: dayOrders.filter((o) => o.timestamps?.picked).length,
        packed: dayOrders.filter((o) => o.stage === 'packed' || o.timestamps?.shipped).length, // packed before shipped
        shipped: dayOrders.filter((o) => o.timestamps?.shipped).length
      };
    });
    return last7Days;
  }, [filteredOrders]);


  // Carrier Performance
  const carrierPerformance = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    const carriers = ['UPS', 'FedEx', 'USPS', 'DHL'];
    return carriers.map((carrier) => {
      const carrierOrders = filteredOrders.filter((o) => o.carrier === carrier && o.transitDays);
      const transitDaysList = carrierOrders.map((o) => o.transitDays).filter((t) => t != null);
      const onTimeCount = carrierOrders.filter((o) => o.sla?.onTime).length;
      const onTimePct = carrierOrders.length > 0 ? onTimeCount / carrierOrders.length * 100 : 0;

      return {
        carrier,
        avgTransit: transitDaysList.length > 0 ? transitDaysList.reduce((a, b) => a + b, 0) / transitDaysList.length : 0,
        onTimePct,
        orders: carrierOrders.length
      };
    }).filter((c) => c.orders > 0); // Only show carriers with orders
  }, [filteredOrders]);

  // Picking Funnel
  const pickingFunnel = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    const stages = ['created', 'allocated', 'batched', 'picked', 'packed', 'shipped'];
    const funnel = stages.map((stageName, idx) => {
      const count = filteredOrders.filter((o) => {
        const orderStageIndex = stages.indexOf(o.stage);
        // An order is "at" or "past" a stage if its current stage index is >= the stage we're looking at
        return orderStageIndex >= idx;
      }).length;

      const prevCount = idx > 0 ? filteredOrders.filter((o) => {
        const orderStageIndex = stages.indexOf(o.stage);
        return orderStageIndex >= idx - 1;
      }).length : filteredOrders.length; // For 'created', previous is total orders

      const conversion = prevCount > 0 ? count / prevCount * 100 : 0;

      const bottleneck = conversion < 85 ? `${stageName} delayed` : null;

      return { stage: stageName, count, conversion, bottleneck };
    });
    return funnel;
  }, [filteredOrders]);

  // Demand Spike Detection
  const demandSpikes = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    const skuCounts = {};
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        skuCounts[item.sku] = (skuCounts[item.sku] || 0) + item.qtyOrdered;
      });
    });

    return Object.entries(skuCounts).
    sort((a, b) => b[1] - a[1]).
    slice(0, 3).
    map(([sku, count]) => ({
      sku,
      count,
      trend: '+' + Math.floor(Math.random() * 50 + 10) + '%'
    }));
  }, [filteredOrders]);

  // VIP Orders at Risk
  const vipAtRisk = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    return filteredOrders.filter((o) => o.isVIP && o.sla?.risk === 'high').slice(0, 3);
  }, [filteredOrders]);

  // inventoryStats, getStockStatus were moved to InventoryManagement component

  // Get at-risk orders for floating panel
  const atRiskOrders = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    return filteredOrders.filter((o) => o.sla?.risk === 'high').slice(0, 3);
  }, [filteredOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "shipped":return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "packed":return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "picking":return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "processing":return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "pending":return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "partially_shipped":return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "canceled":return "bg-red-500/10 text-red-600 border-red-500/20";
      case "exception":return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "captured":return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "authorized":return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "hold":return "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse";
      case "failed":return "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
      default:return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low":return "text-emerald-600";
      case "med":return "text-amber-600";
      case "high":return "text-red-600";
      default:return "text-gray-600";
    }
  };

  // getStockStatus was moved to InventoryManagement component

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => Array.isArray(arr) ? sum + arr.length : arr ? 1 : 0, 0);


  const Sparkline = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-6"></div>;
    return (
      <ResponsiveContainer width="100%" height={24}>
        <LineChart data={data.map((value, i) => ({ value, index: i }))}>
          <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>);

  };

  const KPICard = ({ title, value, change, trend }) =>
  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">{title}</span>
          <Badge className={cn(
          "text-xs font-mono px-1.5 py-0 font-medium",
          change > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        )}>
            {change > 0 ? '+' : ''}{change}%
          </Badge>
        </div>
        <div className="text-2xl font-semibold font-mono text-slate-900 mb-2">{value}</div>
        <div className="h-6 text-slate-400 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.1))]">
          <Sparkline data={trend} />
        </div>
      </CardContent>
    </Card>;


  // Calculate real-time SLA for an order
  const calculateSLA = (order) => {
    if (!order?.sla?.promisedShipBy) return { hoursLeft: 0, mins: 0, minutesLeft: 0 };
    const minutesLeft = differenceInMinutes(new Date(order.sla.promisedShipBy), currentTime);
    const hoursLeft = Math.floor(minutesLeft / 60);
    const mins = minutesLeft % 60;
    return { hoursLeft, mins, minutesLeft };
  };

  const handleAiChat = (message) => {
    setAiChatMessages([...aiChatMessages, { role: 'user', content: message }]);
    setAiChatInput("");

    setTimeout(() => {
      let response = "";
      if (message.toLowerCase().includes('fedex') && message.toLowerCase().includes('sla')) {
        const fedex = carrierPerformance.find((c) => c.carrier === 'FedEx');
        response = `FedEx on-time rate is ${fedex?.onTimePct.toFixed(1)}% with avg transit ${fedex?.avgTransit.toFixed(1)} days. ${fedex?.onTimePct < 90 ? 'Below target - consider reviewing pickup schedules and weather delays.' : 'Performance is solid.'}`;
      } else if (message.toLowerCase().includes('warehouse') && message.toLowerCase().includes('exception')) {
        response = `WH-C had the highest exception rate this week (12 incidents). Root causes: (1) Staffing gaps Tue-Wed, (2) Inventory system sync issues, (3) FedEx pickup delays. Recommended: Enable temporary labor pool and sync inventory hourly.`;
      } else if (message.toLowerCase().includes('expedite')) {
        response = `Found ${atRiskOrders.length} orders requiring expedite before tomorrow. Auto-upgrade available for ${Math.floor(atRiskOrders.length * 0.7)} orders. Estimated cost: $${(atRiskOrders.length * 15).toFixed(2)}.`;
      } else if (message.toLowerCase().includes('cost') && message.toLowerCase().includes('serve')) {
        response = `Current cost to serve: $${metrics.avgCostToServe.toFixed(2)}/order. Trending ${Math.random() > 0.5 ? 'down' : 'up'} ${(Math.random() * 5 + 2).toFixed(1)}% vs last month. Key drivers: carrier rates, labor efficiency, automation adoption.`;
      } else {
        response = "I can analyze orders, SLA risks, carrier performance, warehouse efficiency, and cost trends. Try asking specific questions about your operations.";
      }
      setAiChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  const handleActionApply = (actionType, orderId = null) => {
    setAppliedActions((prev) => [...prev, { type: actionType, orderId, timestamp: new Date() }]);

    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
        <span>{actionType} applied successfully</span>
      </div>
    );
  };

  const addCarton = () => {
    if (newCarton.weight && newCarton.length && newCarton.width && newCarton.height) {
      setCartons([...cartons, { ...newCarton, id: `CTN-${cartons.length + 1}` }]);
      setNewCarton({ weight: '', length: '', width: '', height: '' });
      toast.success('Carton added successfully!');
    } else {
      toast.error('Please fill all carton details.');
    }
  };

  // METRIC CARD COMPONENTS
  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, onClick, isRisk }) =>
  <motion.div
    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
    onClick={onClick}
    className={cn(
      "cursor-pointer",
      isRisk && metrics.slaRiskPct > 15 && "animate-pulse"
    )}>

      <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm hover:shadow-lg transition-all h-full relative overflow-hidden">
        <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-5 transition-opacity",
        isRisk && metrics.slaRiskPct > 15 ? "from-red-500 to-orange-500" : "from-blue-500 to-purple-500"
      )}></div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn(
              "p-2 rounded-lg",
              isRisk && metrics.slaRiskPct > 15 ? "bg-red-50" : "bg-blue-50"
            )}>
                <Icon className={cn(
                "w-4 h-4",
                isRisk && metrics.slaRiskPct > 15 ? "text-red-600" : "text-blue-600"
              )} />
              </div>
              <span className="text-xs font-medium text-slate-600">{title}</span>
            </div>
            {trend && <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">+{trend}%</Badge>}
          </div>
          <div className="text-3xl font-semibold text-slate-900 mb-1">{value}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </CardContent>
      </Card>
    </motion.div>;


  const GaugeCard = ({ title, value, max = 100, target = 95 }) => {
    const percentage = value / max * 100;
    const rotation = percentage / 100 * 180 - 90;
    const color = percentage >= 95 ? '#10b981' : percentage >= 90 ? '#f59e0b' : '#ef4444';

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm hover:shadow-lg transition-all h-full">
        <CardContent className="p-4">
          <div className="text-xs font-medium text-slate-600 mb-4">{title}</div>
          <div className="relative w-full h-24 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 60">
              <path
                d="M 10 50 A 40 40 0 0 1 110 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
                strokeLinecap="round" />

              <motion.path
                d="M 10 50 A 40 40 0 0 1 110 50"
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 1.57} 157`}
                initial={{ strokeDasharray: "0 157" }}
                animate={{ strokeDasharray: `${percentage * 1.57} 157` }}
                transition={{ duration: 1, ease: "easeOut" }} />

              <circle cx="60" cy="50" r="3" fill={color} />
              <motion.line
                x1="60"
                y1="50"
                x2="60"
                y2="20"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${rotation} 60 50)`}
                initial={{ transform: "rotate(-90 60 50)" }}
                animate={{ transform: `rotate(${rotation} 60 50)` }}
                transition={{ duration: 1, ease: "easeOut" }} />

            </svg>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">{value.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Target: {target}%</div>
          </div>
        </CardContent>
      </Card>);

  };

  const minutesSinceSync = differenceInMinutes(currentTime, lastSync);

  // Helper to get Lucide Icon component dynamically (was used in original code, but not outline. Keeping just in case, but it's not strictly needed for the outline's changes)
  const IconComponent = ({ name, ...props }) => {
    const LucideIcon = eval(name); // WARNING: eval can be dangerous with untrusted input. For static icons like this, it's generally fine.
    if (!LucideIcon) return null;
    return <LucideIcon {...props} />;
  };

  const handleSelectOrder = (orderId, checked) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAllOrders = (checked) => {
    if (checked) {
      setSelectedOrders(filteredOrders.slice(0, 50).map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };


  return (
    <div className="bg-gradient-to-br p-6 rounded-[10px] space-y-6 from-slate-50 via-slate-100 to-slate-50 min-h-screen">
      {/* TOP COMMAND STRIP */}
      <div className="bg-white/90 backdrop-blur-xl border-2 border-slate-200/50 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-0 left-0 animate-ping"></div>
              </div>
              <span className="text-xs font-medium text-slate-600">
                Last synced: {minutesSinceSync === 0 ? 'just now' : `${minutesSinceSync}m ago`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                className="gap-2">

                {autoUpdateEnabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span className="text-xs">{autoUpdateEnabled ? 'Live' : 'Paused'}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200/50 hover:bg-slate-50 rounded-lg"
              onClick={() => {
                setExplainViewOpen(true);
                setAiTypingText("");
              }}>

              <Brain className="w-4 h-4" />
              Explain This View
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200/50 hover:bg-slate-50 rounded-lg"
              onClick={() => setCopilotVisible(!copilotVisible)}>

              <Bot className="w-4 h-4" />
              AI Copilot
            </Button>

            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
              {['All', 'Shopify', 'Amazon', 'POS'].map((ch) =>
              <Button
                key={ch}
                variant={filters.channel.length === 0 && ch === 'All' || filters.channel.includes(ch) && ch !== 'All' ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => {
                  if (ch === 'All') {
                    setFilters({ ...filters, channel: [] });
                  } else {
                    setFilters({
                      ...filters,
                      channel: filters.channel.includes(ch) ?
                      filters.channel.filter((c) => c !== ch) :
                      [...filters.channel, ch]
                    });
                  }
                }}>

                  {ch}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1 shadow-sm">
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg">

            <ShoppingCart className="w-4 h-4 mr-2" />
            Order Management
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg">

            <Package className="w-4 h-4 mr-2" />
            Inventory Management
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-700 rounded-lg">

            <Users className="w-4 h-4 mr-2" />
            Customer Management
          </TabsTrigger>
        </TabsList>

        {/* ORDER MANAGEMENT TAB */}
        <TabsContent value="orders" className="space-y-6">
          {/* Top Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search order #, customer, email, SKU"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/80 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl" />

              </div>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="7D">7 Days</SelectItem>
                  <SelectItem value="30D">30 Days</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setFilterSheetOpen(true)}
                className="border-slate-200/50 hover:bg-slate-50 rounded-xl relative bg-white/80 backdrop-blur-sm">

                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 &&
                <Badge className="ml-2 bg-blue-600 text-white border-0 px-1.5 py-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                }
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-slate-200/50 hover:bg-slate-50 rounded-xl bg-white/80 backdrop-blur-sm"
                onClick={() => setAutomationRulesOpen(true)}>

                <Zap className="w-4 h-4 mr-2" />
                Automation
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-sm"
                onClick={() => setCreateOrderOpen(true)}>

                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          </div>

          {/* METRICS SECTION - BENTO BOX LAYOUT */}
          <div className="space-y-4">
            {/* Row 1: Mini KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <MetricCard
                title="Orders Inflow"
                value={metrics.ordersInflow}
                icon={TrendingUp}
                trend={12}
                onClick={() => {
                  setSelectedMetric({ title: 'Orders Inflow', data: metrics });
                  setMetricsDrawerOpen(true);
                }} />

              <GaugeCard title="On-Time Ship Rate" value={metrics.onTimeShipRate} target={95} />
              <MetricCard
                title="SLA Risk %"
                value={`${metrics.slaRiskPct.toFixed(1)}%`}
                subtitle={`${metrics.atRiskCount} at risk`}
                icon={AlertCircle}
                isRisk={true}
                onClick={() => setFilters({ ...filters, status: ['processing', 'picking'] })} />

              <MetricCard title="Exception Rate" value={`${metrics.exceptionRate.toFixed(1)}%`} icon={AlertTriangle} />
              <MetricCard
                title="Lead Time"
                value={`${metrics.p50LeadTime}h`}
                subtitle={`p90: ${metrics.p90LeadTime}h`}
                icon={Clock} />

              <MetricCard title="Fill Rate" value={`${metrics.fillRate.toFixed(1)}%`} icon={PackageCheck} />
              <MetricCard title="Payment Capture" value={`${metrics.paymentCaptureRate.toFixed(1)}%`} icon={DollarSign} />
              <MetricCard title="Cost to Serve" value={`$${metrics.avgCostToServe.toFixed(2)}`} icon={Target} />
            </div>

            {/* Row 2: Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Throughput Trend */}
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-700">Throughput Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={throughputTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }} />

                      <Area
                        type="monotone"
                        dataKey="created"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        onClick={() => setFilters((prev) => ({ ...prev, stage: 'created' }))}
                        style={{ cursor: 'pointer' }} />

                      <Area
                        type="monotone"
                        dataKey="picked"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                        onClick={() => setFilters((prev) => ({ ...prev, stage: 'picked' }))}
                        style={{ cursor: 'pointer' }} />

                      <Area
                        type="monotone"
                        dataKey="packed"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        onClick={() => setFilters((prev) => ({ ...prev, stage: 'packed' }))}
                        style={{ cursor: 'pointer' }} />

                      <Area
                        type="monotone"
                        dataKey="shipped"
                        stackId="1"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.6}
                        onClick={() => setFilters((prev) => ({ ...prev, stage: 'shipped' }))}
                        style={{ cursor: 'pointer' }} />

                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2 text-xs justify-center">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-slate-600">Created</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-slate-600">Picked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      <span className="text-slate-600">Packed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                      <span className="text-slate-600">Shipped</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Picking Funnel */}
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-700">Picking Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pickingFunnel.map((stage, idx) =>
                    <motion.div
                      key={stage.stage}
                      className="cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setFilters((prev) => ({ ...prev, stage: stage.stage }))}>

                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-700 capitalize">{stage.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">{stage.count}</span>
                            {idx > 0 &&
                          <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                {stage.conversion.toFixed(0)}%
                              </Badge>
                          }
                          </div>
                        </div>
                        <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.count / (filteredOrders.length > 0 ? filteredOrders.length : 1) * 100}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className={cn(
                            "h-full flex items-center justify-end pr-2",
                            "bg-gradient-to-r from-blue-500 to-purple-500"
                          )}>

                            <span className="text-white text-xs font-medium">
                              {(stage.count / (filteredOrders.length > 0 ? filteredOrders.length : 1) * 100).toFixed(0)}%
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Carrier Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-700">Carrier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={carrierPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="carrier" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }} />

                      <Bar dataKey="avgTransit" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                        {carrierPerformance.map((entry, index) =>
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.onTimePct >= 95 ? '#10b981' : entry.onTimePct >= 90 ? '#f59e0b' : '#ef4444'} />

                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {carrierPerformance.map((carrier) =>
                    <div key={carrier.carrier} className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="text-xs font-medium text-slate-700">{carrier.carrier}</div>
                        <div className="text-lg font-semibold text-slate-900">{carrier.onTimePct.toFixed(0)}%</div>
                        <div className="text-xs text-slate-500">on-time</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Forecast */}
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    72-Hour SLA Risk Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {atRiskOrders.map((order) => {
                      const sla = calculateSLA(order);
                      return (
                        <div key={order.id} className="p-3 bg-red-50/50 border border-red-100/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{order.orderNo}</span>
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-mono">
                              {sla.hoursLeft}h {sla.mins}m
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleActionApply('SLA Upgrade', order.id)}>
                              Auto-Upgrade
                            </Button>
                            <Button size="sm" className="flex-1 h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleActionApply('Reroute', order.id)}>
                              Re-route
                            </Button>
                          </div>
                        </div>);

                    })}
                    {atRiskOrders.length === 0 &&
                    <div className="text-center py-8 text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                        <p className="text-sm">No SLA risks forecast</p>
                      </div>
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* BOTTOM INSIGHTS LAYER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Demand Spike Detector */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-orange-600" />
                  Demand Spikes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demandSpikes.map((spike, idx) =>
                  <div key={idx} className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{spike.sku}</div>
                        <div className="text-xs text-slate-600">{spike.count} units</div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                        {spike.trend}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Automation Impact */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  Automation Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  ${(appliedActions.length * 3.5).toFixed(2)}
                </div>
                <div className="text-xs text-slate-600 mb-3">Saved this session</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Batch optimizations</span>
                    <span className="font-medium">{Math.floor(appliedActions.length * 0.6)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Smart routing</span>
                    <span className="font-medium">{Math.floor(appliedActions.length * 0.4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VIP Customer Impact */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  VIP Orders at Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-3">
                  {vipAtRisk.length}
                </div>
                <div className="space-y-1">
                  {vipAtRisk.map((order) =>
                  <div
                    key={order.id}
                    className="text-xs p-2 bg-white/80 rounded cursor-pointer hover:bg-white"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderDrawerOpen(true);
                    }}>

                      <div className="font-medium text-slate-900">{order.orderNo}</div>
                      <div className="text-slate-600">{order.customer.name}</div>
                    </div>
                  )}
                  {vipAtRisk.length === 0 &&
                  <div className="text-xs text-slate-500 text-center py-4">
                      All VIP orders on track ✨
                    </div>
                  }
                </div>
              </CardContent>
            </Card>

            {/* AI Learning Log */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  AI Learning Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-slate-600 max-h-32 overflow-y-auto">
                  <div className="flex items-start gap-2">
                    <Clock className="w-3 h-3 mt-0.5 text-blue-500" />
                    <div>
                      <div className="font-medium text-slate-900">Batch efficiency improved</div>
                      <div className="text-slate-500">Zone 4/5 avg time -12%</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3 h-3 mt-0.5 text-blue-500" />
                    <div>
                      <div className="font-medium text-slate-900">Carrier prediction updated</div>
                      <div className="text-slate-500">FedEx reliability +3.2%</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3 h-3 mt-0.5 text-blue-500" />
                    <div>
                      <div className="font-medium text-slate-900">SLA model tuned</div>
                      <div className="text-slate-500">Accuracy now 94.3%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
            <KPICard title="Orders Today" value={kpis.today.value} change={kpis.today.change} trend={kpis.today.trend} />
            <KPICard title="Pending" value={kpis.pending.value} change={kpis.pending.change} trend={kpis.pending.trend} />
            <KPICard title="Processing" value={kpis.processing.value} change={kpis.processing.change} trend={kpis.processing.trend} />
            <KPICard title="Packed" value={kpis.packed.value} change={kpis.packed.change} trend={kpis.packed.trend} />
            <KPICard title="Shipped" value={kpis.shipped.value} change={kpis.shipped.change} trend={kpis.shipped.trend} />
            <KPICard title="Delivered" value={kpis.delivered.value} change={kpis.delivered.change} trend={kpis.delivered.trend} />
            <KPICard title="At-Risk SLAs" value={kpis.atRisk.value} change={kpis.atRisk.change} trend={kpis.atRisk.trend} />
            <KPICard title="Backorders" value={kpis.backorders.value} change={kpis.backorders.change} trend={kpis.backorders.trend} />
            <KPICard title="RMAs" value={kpis.rmas.value} change={kpis.rmas.change} trend={kpis.rmas.trend} />
          </div>

          {/* AI Operations Console - ENHANCED */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  AI Operations Console
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 rounded-xl"
                  onClick={() => {
                    setExplainViewOpen(true); // Changed from explainSpikeOpen
                    setAiTypingText("");
                  }}>

                  Explain Spike
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-3">Suggested Batches</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 rounded-xl">
                      <div className="text-sm font-medium text-slate-900 mb-1">12 orders • WH-A • Zone 4/5</div>
                      <div className="text-xs text-slate-600 mb-2">2.1 kg avg weight</div>
                      <div className="flex gap-1">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs" onClick={() => handleActionApply('Batch pick suggestion')}>
                          Auto-apply
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Ignore
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50/50 backdrop-blur-sm border border-purple-100/50 rounded-xl">
                      <div className="text-sm font-medium text-slate-900 mb-1">8 orders • WH-B • Zone 2</div>
                      <div className="text-xs text-slate-600 mb-2">1.5 kg avg weight</div>
                      <div className="flex gap-1">
                        <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs" onClick={() => handleActionApply('Batch pick suggestion')}>
                          Auto-apply
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-3">At-Risk Orders</div>
                  <div className="space-y-2">
                    {filteredOrders.filter((o) => o.sla?.risk === 'high').slice(0, 3).map((order) => {
                      const sla = calculateSLA(order);
                      return (
                        <motion.div
                          key={order.id}
                          className={cn(
                            "p-3 bg-red-50/50 backdrop-blur-sm border border-red-100/50 rounded-xl transition-all",
                            sla.minutesLeft < 360 && "animate-pulse"
                          )}
                          onMouseEnter={() => setHoveredAtRiskOrder(order.id)}
                          onMouseLeave={() => setHoveredAtRiskOrder(null)}
                          animate={{
                            scale: hoveredAtRiskOrder === order.id ? 1.02 : 1
                          }}>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{order.orderNo}</span>
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-mono">
                              {sla.hoursLeft}h {sla.mins}m
                            </Badge>
                          </div>
                          <AnimatePresence>
                            {hoveredAtRiskOrder === order.id &&
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-slate-600 mb-2 space-y-1">

                                <div>📍 {order.warehouse} • {order.carrier}</div>
                                <div>📦 Status: {order.status}</div>
                              </motion.div>
                            }
                          </AnimatePresence>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1 text-xs rounded-lg border-slate-200" onClick={() => handleActionApply('Reroute', order.id)}>
                              Re-route
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs rounded-lg border-slate-200" onClick={() => handleActionApply('SLA Upgrade', order.id)}>
                              Upgrade
                            </Button>
                          </div>
                        </motion.div>);

                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-3">Cost-Saving Ideas</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100/50 rounded-xl">
                      <div className="text-sm text-slate-900 mb-2">Consolidate split shipments for 7 orders</div>
                      <div className="flex gap-1">
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs" onClick={() => handleActionApply('Consolidate Shipments')}>
                          Auto-apply
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Ignore
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50/50 backdrop-blur-sm border border-amber-100/50 rounded-xl">
                      <div className="text-sm text-slate-900 mb-2">Move 18 units SKU-A to WH-B</div>
                      <div className="flex gap-1">
                        <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs" onClick={() => handleActionApply('Move Inventory')}>
                          Auto-apply
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table WITH SCROLL */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrders.length === filteredOrders.slice(0, 50).length && filteredOrders.slice(0, 50).length > 0}
                          onCheckedChange={(checked) => handleSelectAllOrders(checked)} />

                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Order #</TableHead>
                      <TableHead className="font-semibold text-slate-700">Channel</TableHead>
                      <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                      <TableHead className="font-semibold text-slate-700">Items</TableHead>
                      <TableHead className="font-semibold text-slate-700">Total</TableHead>
                      <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Fulfillment</TableHead>
                      <TableHead className="font-semibold text-slate-700">SLA</TableHead>
                      <TableHead className="font-semibold text-slate-700">Flags</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.slice(0, 50).map((order) => {
                      const sla = calculateSLA(order);
                      return (
                        <TableRow
                          key={order.id}
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDrawerOpen(true);
                          }}>

                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleSelectOrder(order.id, checked)} />

                          </TableCell>
                          <TableCell className="font-mono text-sm text-blue-600 font-medium">
                            {order.orderNo}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                              {order.channel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-slate-900">{order.customer.name}</div>
                            <div className="text-xs text-slate-500">{order.customer.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                              {order.items.length} items
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold text-slate-900">
                            ${order.totals.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentColor(order.payment.status)}>
                              {order.payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-slate-600">
                              {order.warehouse} • {order.carrier}
                              {order.tracking.length > 0 && <div className="text-blue-600 font-mono">{order.tracking[0]}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CircleDot className={cn("w-3 h-3", getRiskColor(order.sla.risk))} />
                              <span className={cn(
                                "text-xs font-mono",
                                sla.minutesLeft < 360 ? "text-red-600 font-semibold" : "text-slate-600"
                              )}>
                                {sla.minutesLeft > 0 ? `${sla.hoursLeft}h ${sla.mins}m` : 'Overdue'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {order.flags.fraud &&
                              <AlertTriangle className="w-4 h-4 text-red-600" title="Fraud" />
                              }
                              {order.flags.address &&
                              <MapPin className="w-4 h-4 text-amber-600" title="Address Issue" />
                              }
                              {order.flags.backorder &&
                              <PackageX className="w-4 h-4 text-orange-600" title="Backorder" />
                              }
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Print">
                                <Printer className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Ship">
                                <Ship className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>);

                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* STICKY BULK ACTION BAR */}
          <AnimatePresence>
            {selectedOrders.length > 0 &&
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">

                <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-500 text-white border-0">
                        {selectedOrders.length} selected
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => handleActionApply('Batch Pick', selectedOrders.join(','))}>
                          <PackageCheck className="w-4 h-4" />
                          Batch Pick
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-2" onClick={() => handleActionApply('Print Labels', selectedOrders.join(','))}>
                          <Printer className="w-4 h-4" />
                          Print Labels
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => handleActionApply('Assign Courier', selectedOrders.join(','))}>
                          <Ship className="w-4 h-4" />
                          Assign Courier
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 gap-2" onClick={() => handleActionApply('Export Orders', selectedOrders.join(','))}>
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setSelectedOrders([])}>

                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            }
          </AnimatePresence>
        </TabsContent>

        {/* INVENTORY MANAGEMENT TAB */}
        <TabsContent value="inventory" className="space-y-6">
          <InventoryManagement />
        </TabsContent>

        {/* CUSTOMER MANAGEMENT TAB */}
        <TabsContent value="customers" className="space-y-6">
          <CustomerManagement />
        </TabsContent>
      </Tabs>

      {/* SLA FLOATING PANEL - NEW */}
      <AnimatePresence>
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onMouseEnter={() => setSlaFloatingOpen(true)}
          onMouseLeave={() => setSlaFloatingOpen(false)}>

          <div className={cn(
            "bg-white/90 backdrop-blur-xl border-2 rounded-xl shadow-lg transition-all",
            kpis.atRisk.value > 0 ? "border-red-500/50" : "border-slate-200/50"
          )}>
            <div className="p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  kpis.atRisk.value > 0 && "animate-pulse bg-red-100"
                )}>
                  <AlertCircle className={cn(
                    "w-6 h-6",
                    kpis.atRisk.value > 0 ? "text-red-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{kpis.atRisk.value}</div>
                  <div className="text-xs text-slate-600">SLA Breaches</div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {slaFloatingOpen && kpis.atRisk.value > 0 &&
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200">

                  <div className="p-4 space-y-2 max-w-xs">
                    <div className="text-sm font-semibold text-slate-900 mb-3">Top At-Risk</div>
                    {atRiskOrders.map((order) => {
                    const sla = calculateSLA(order);
                    return (
                      <div key={order.id} className="p-2 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-medium">{order.orderNo}</span>
                            <span className="text-xs text-red-600 font-mono">{sla.hoursLeft}h {sla.mins}m</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" className="flex-1 h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleActionApply('Reroute', order.id)}>
                              Re-route
                            </Button>
                            <Button size="sm" className="flex-1 h-6 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleActionApply('SLA Upgrade', order.id)}>
                              Upgrade
                            </Button>
                          </div>
                        </div>);

                  })}
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>


      {/* Filter Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent className="bg-white w-96">
          <SheetHeader>
            <SheetTitle className="text-slate-900">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">Status</Label>
              <div className="space-y-2">
                {['pending', 'processing', 'picking', 'packed', 'shipped', 'delivered'].map((status) =>
                <div key={status} className="flex items-center">
                    <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={(checked) => {
                      setFilters((prev) => ({
                        ...prev,
                        status: checked ?
                        [...prev.status, status] :
                        prev.status.filter((s) => s !== status)
                      }));
                    }} />

                    <label htmlFor={`status-${status}`} className="ml-2 text-sm text-slate-700 capitalize cursor-pointer">
                      {status.replace('_', ' ')}
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">Channel</Label>
              <div className="space-y-2">
                {['Shopify', 'Amazon', 'POS', 'Manual'].map((channel) =>
                <div key={channel} className="flex items-center">
                    <Checkbox
                    id={`channel-${channel}`}
                    checked={filters.channel.includes(channel)}
                    onCheckedChange={(checked) => {
                      setFilters((prev) => ({
                        ...prev,
                        channel: checked ?
                        [...prev.channel, channel] :
                        prev.channel.filter((c) => c !== channel)
                      }));
                    }} />

                    <label htmlFor={`channel-${channel}`} className="ml-2 text-sm text-slate-700 cursor-pointer">
                      {channel}
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 rounded-xl"
                onClick={() => setFilters({ status: [], channel: [], payment: [], warehouse: [], carrier: [], risk: [], flags: [], stage: null })}>

                Clear All
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                onClick={() => setFilterSheetOpen(false)}>

                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Order Drawer - KEEPING ALL THE DETAILED CONTENT */}
      <Sheet open={orderDrawerOpen} onOpenChange={setOrderDrawerOpen}>
        <SheetContent className="bg-white w-[600px] overflow-y-auto">
          {selectedOrder &&
          <>
              <SheetHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl font-bold text-slate-900">{selectedOrder.orderNo}</SheetTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.replace('_', ' ')}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                        {selectedOrder.channel}
                      </Badge>
                      <span className="text-sm font-mono font-semibold text-slate-900">
                        ${selectedOrder.totals.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOrderDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600">

                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    <PackageCheck className="w-4 h-4 mr-1" />
                    Allocate
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 rounded-lg">
                    <Printer className="w-4 h-4 mr-1" />
                    Pick List
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 rounded-lg">
                    <Ship className="w-4 h-4 mr-1" />
                    Ship
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 rounded-lg text-red-600 hover:text-red-700">
                    Cancel
                  </Button>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white">Overview</TabsTrigger>
                  <TabsTrigger value="items" className="rounded-lg data-[state=active]:bg-white">Items</TabsTrigger>
                  <TabsTrigger value="fulfillment" className="rounded-lg data-[state=active]:bg-white">Fulfillment</TabsTrigger>
                  <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-white">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  {/* Customer Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{selectedOrder.customer.name}</div>
                        <div className="text-sm text-slate-600">{selectedOrder.customer.email}</div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          {selectedOrder.customer.segment}
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          LTV: ${selectedOrder.customer.ltv}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-200 rounded-lg">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-200 rounded-lg">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-900">Shipping Address</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-slate-700">
                        {selectedOrder.shippingAddress.street}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                        {selectedOrder.shippingAddress.country}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-900">Billing Address</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-slate-700">
                        {selectedOrder.billingAddress.street}<br />
                        {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zip}<br />
                        {selectedOrder.billingAddress.country}
                      </div>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-900 mb-3">Order Totals</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-mono font-semibold">${selectedOrder.totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span className="font-mono font-semibold">-${selectedOrder.totals.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Shipping</span>
                        <span className="font-mono font-semibold">${selectedOrder.totals.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tax</span>
                        <span className="font-mono font-semibold">${selectedOrder.totals.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="font-mono font-bold text-lg">${selectedOrder.totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* SLA Panel */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-900">SLA Status</span>
                      <Badge className={cn(
                      selectedOrder.sla.risk === 'low' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      selectedOrder.sla.risk === 'med' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    )}>
                        {selectedOrder.sla.risk === 'low' ? 'On Track' : selectedOrder.sla.risk === 'med' ? 'At Risk' : 'Critical'}
                      </Badge>
                    </div>
                    {(() => {
                    const sla = calculateSLA(selectedOrder);
                    return (
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Ship By</span>
                            <span className="font-medium">{format(new Date(selectedOrder.sla.promisedShipBy), 'MMM d, h:mm a')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Deliver By</span>
                            <span className="font-medium">{format(new Date(selectedOrder.sla.promisedDeliverBy), 'MMM d, h:mm a')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Time Left</span>
                            <span className={cn(
                            "font-mono font-semibold",
                            getRiskColor(selectedOrder.sla.risk)
                          )}>
                              {sla.minutesLeft > 0 ? `${sla.hoursLeft} hours ${sla.mins} minutes` : 'Overdue'}
                            </span>
                          </div>
                        </div>);

                  })()}
                  </div>

                  {/* Flags */}
                  {(selectedOrder.flags.fraud || selectedOrder.flags.address || selectedOrder.flags.backorder) &&
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-xs font-semibold text-slate-900 mb-3">Attention Required</div>
                      <div className="space-y-2">
                        {selectedOrder.flags.fraud &&
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-slate-900">Fraud Risk Detected</span>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs rounded-lg border-slate-200">
                              Review
                            </Button>
                          </div>
                    }
                        {selectedOrder.flags.address &&
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-600" />
                              <span className="text-sm text-slate-900">Address Validation Failed</span>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs rounded-lg border-slate-200">
                              Validate
                            </Button>
                          </div>
                    }
                        {selectedOrder.flags.backorder &&
                    <div className="flex items-center gap-2 justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <PackageX className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-slate-900">Items on Backorder</span>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs rounded-lg border-slate-200">
                              Reroute
                            </Button>
                          </div>
                    }
                      </div>
                    </div>
                }
                </TabsContent>

                <TabsContent value="items" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) =>
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-600">SKU: {item.sku}</div>
                            {item.variant &&
                        <div className="text-xs text-slate-500">{item.variant}</div>
                        }
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono font-semibold text-slate-900">
                              ${(item.unitPrice * item.qtyOrdered).toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-600">
                              ${item.unitPrice.toFixed(2)} × {item.qtyOrdered}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-slate-600 mb-1">Ordered</div>
                            <div className="font-semibold">{item.qtyOrdered}</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-slate-600 mb-1">Allocated</div>
                            <div className={cn(
                          "font-semibold",
                          item.qtyAllocated < item.qtyOrdered ? "text-amber-600" : "text-emerald-600"
                        )}>
                              {item.qtyAllocated}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-slate-600 mb-1">Picked</div>
                            <div className="font-semibold">{item.qtyPicked}</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <div className="text-slate-600 mb-1">Shipped</div>
                            <div className="font-semibold">{item.qtyShipped}</div>
                          </div>
                        </div>
                        {item.qtyAllocated < item.qtyOrdered &&
                    <Button size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs">
                            Allocate Remaining ({item.qtyOrdered - item.qtyAllocated})
                          </Button>
                    }
                      </div>
                  )}
                  </div>
                </TabsContent>

                <TabsContent value="fulfillment" className="space-y-4 mt-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-900 mb-3">Fulfillment Status</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Warehouse</span>
                        <span className="font-medium">{selectedOrder.warehouse}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Carrier</span>
                        <span className="font-medium">{selectedOrder.carrier}</span>
                      </div>
                      {selectedOrder.tracking.length > 0 &&
                    <div className="flex justify-between">
                          <span className="text-slate-600">Tracking</span>
                          <span className="font-mono font-medium text-blue-600">{selectedOrder.tracking[0]}</span>
                        </div>
                    }
                    </div>
                  </div>

                  {/* Carton Builder */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-900 mb-3 flex items-center justify-between">
                      Carton Builder
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setCartons([])}>
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label htmlFor="carton-weight" className="text-xs">Weight (kg)</Label>
                        <Input
                        id="carton-weight"
                        type="number"
                        placeholder="e.g. 1.2"
                        value={newCarton.weight}
                        onChange={(e) => setNewCarton({ ...newCarton, weight: e.target.value })}
                        className="mt-1 bg-white border-slate-200 rounded-lg h-8 text-sm" />

                      </div>
                      <div>
                        <Label htmlFor="carton-length" className="text-xs">Dimensions (cm)</Label>
                        <div className="flex gap-1 mt-1">
                          <Input
                          id="carton-length"
                          type="number"
                          placeholder="L"
                          value={newCarton.length}
                          onChange={(e) => setNewCarton({ ...newCarton, length: e.target.value })}
                          className="bg-white border-slate-200 rounded-lg h-8 text-sm" />

                          <Input
                          type="number"
                          placeholder="W"
                          value={newCarton.width}
                          onChange={(e) => setNewCarton({ ...newCarton, width: e.target.value })}
                          className="bg-white border-slate-200 rounded-lg h-8 text-sm" />

                          <Input
                          type="number"
                          placeholder="H"
                          value={newCarton.height}
                          onChange={(e) => setNewCarton({ ...newCarton, height: e.target.value })}
                          className="bg-white border-slate-200 rounded-lg h-8 text-sm" />

                        </div>
                      </div>
                    </div>
                    <Button onClick={addCarton} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Carton
                    </Button>

                    {cartons.length > 0 &&
                  <div className="mt-4 space-y-2">
                        {cartons.map((carton, cIdx) =>
                    <div key={cIdx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-sm">
                            <div className="flex items-center gap-2">
                              <Box className="w-4 h-4 text-slate-500" />
                              <span>Carton {carton.id}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                              <span>{carton.weight} kg</span>
                              <span>{carton.length}x{carton.width}x{carton.height} cm</span>
                            </div>
                          </div>
                    )}
                      </div>
                  }
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    <Ship className="w-4 h-4 mr-2" />
                    Create Shipping Label
                  </Button>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {selectedOrder.timeline.map((event, index) =>
                  <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn("w-2 h-2 rounded-full", {
                        'bg-blue-600': event.icon === 'ShoppingCart',
                        'bg-emerald-600': event.icon === 'CheckCircle',
                        'bg-purple-600': event.icon === 'Box' || event.icon === 'Package',
                        'bg-cyan-600': event.icon === 'Ship' || event.icon === 'PackageCheck',
                        'bg-red-600': event.icon === 'PackageX' || event.icon === 'AlertTriangle',
                        'bg-gray-600': !event.icon
                      })} />
                          {index < selectedOrder.timeline.length - 1 &&
                      <div className="w-px h-full bg-slate-200"></div>
                      }
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            <IconComponent name={event.icon} className="w-4 h-4 text-slate-500" />
                            {event.event}
                          </div>
                          <div className="text-xs text-slate-600">{format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}</div>
                        </div>
                      </div>
                  )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          }
        </SheetContent>
      </Sheet>

      {/* Inventory Detail Modal (Moved to InventoryManagement component) */}

      {/* Create Order Modal */}
      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Create New Order</DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a new order to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900">Customer Email</Label>
              <Input placeholder="customer@example.com" className="mt-1 bg-white border-slate-200 rounded-xl" />
            </div>
            <div>
              <Label className="text-slate-900">Channel</Label>
              <Select>
                <SelectTrigger className="mt-1 bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="pos">POS</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 rounded-xl"
                onClick={() => setCreateOrderOpen(false)}>

                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                onClick={() => {
                  toast.success('Order created successfully');
                  setCreateOrderOpen(false);
                }}>

                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EXPLAIN VIEW MODAL - NEW */}
      <Dialog open={explainViewOpen} onOpenChange={setExplainViewOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Analysis: Operations Overview
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 overflow-y-auto">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-mono">
              {aiTypingText}
              {aiTypingText.length < explainViewText.length &&
              <span className="animate-pulse">|</span>
              }
            </div>
            {aiTypingText.length === explainViewText.length &&
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex gap-2">

                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
                <Button variant="outline" className="flex-1 border-slate-200 gap-2">
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </Button>
              </motion.div>
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* FLOATING AI COPILOT */}
      <AnimatePresence>
        {copilotVisible &&
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-50 w-96">

            <Card className="bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 shadow-2xl">
              <CardHeader className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <CardTitle className="text-sm font-medium">AI Copilot</CardTitle>
                  </div>
                  <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setCopilotVisible(false)}>

                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-3">
                  {aiChatMessages.length === 0 &&
                <div className="text-center py-8">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-xs text-slate-600 mb-3">Try asking:</p>
                      <div className="space-y-2">
                        {[
                    "Why are FedEx SLAs dropping?",
                    "Which warehouse had most exceptions?",
                    "Show orders to expedite tomorrow",
                    "Summarize cost to serve trends"].
                    map((q, idx) =>
                    <Button
                      key={idx}
                      size="sm"
                      variant="outline"
                      className="w-full text-xs text-left justify-start border-slate-200"
                      onClick={() => {
                        setAiChatInput(q);
                        handleAiChat(q);
                      }}>

                            {q}
                          </Button>
                    )}
                      </div>
                    </div>
                }
                  {aiChatMessages.map((msg, idx) =>
                <div key={idx} className={cn(
                  "flex gap-2",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                      {msg.role === 'assistant' &&
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-blue-600" />
                        </div>
                  }
                      <div className={cn(
                    "max-w-[85%] p-3 rounded-xl text-xs",
                    msg.role === 'user' ?
                    "bg-blue-600 text-white ml-auto" :
                    "bg-slate-100 text-slate-700"
                  )}>
                        {msg.content}
                      </div>
                    </div>
                )}
                </div>
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <Input
                    placeholder="Ask anything..."
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && aiChatInput && handleAiChat(aiChatInput)}
                    className="flex-1 text-sm" />

                    <Button
                    size="sm"
                    onClick={() => aiChatInput && handleAiChat(aiChatInput)}
                    className="bg-blue-600 hover:bg-blue-700 text-white">

                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        }
      </AnimatePresence>

      {/* AUTOMATION RULES MODAL - NEW */}
      <Dialog open={automationRulesOpen} onOpenChange={setAutomationRulesOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Automation Rules
            </DialogTitle>
            <DialogDescription>
              Configure automated workflows for your operations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Auto-allocate on create</div>
                <div className="text-sm text-slate-600">Automatically allocate inventory when order is created</div>
              </div>
              <Switch
                checked={automationRules.autoAllocate}
                onCheckedChange={(checked) => setAutomationRules({ ...automationRules, autoAllocate: checked })} />

            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Auto-upgrade if SLA risk {'>'} 70%</div>
                <div className="text-sm text-slate-600">Upgrade shipping when SLA breach risk is high</div>
              </div>
              <Switch
                checked={automationRules.autoUpgradeSLA}
                onCheckedChange={(checked) => setAutomationRules({ ...automationRules, autoUpgradeSLA: checked })} />

            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Auto-combine customer orders (same day)</div>
                <div className="text-sm text-slate-600">Combine multiple orders from same customer for cost savings</div>
              </div>
              <Switch
                checked={automationRules.autoCombineOrders}
                onCheckedChange={(checked) => setAutomationRules({ ...automationRules, autoCombineOrders: checked })} />

            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1">
                <div className="font-medium text-slate-900">Auto-notify finance if payment hold {'>'} 24h</div>
                <div className="text-sm text-slate-600">Send alert to finance team for long payment holds</div>
              </div>
              <Switch
                checked={automationRules.autoNotifyFinance}
                onCheckedChange={(checked) => setAutomationRules({ ...automationRules, autoNotifyFinance: checked })} />

            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 border-slate-200" onClick={() => setAutomationRulesOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                toast.success('Automation rules saved');
                setAutomationRulesOpen(false);
              }}>
                Save Rules
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}
