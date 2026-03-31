import * as React from "react";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Map as MapIcon, 
  Users, 
  Package, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  Play, 
  CheckCircle2, 
  Camera, 
  Signature as SignatureIcon, 
  FileText, 
  ArrowLeft,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Download,
  Activity,
  User as UserIcon,
  PieChart as PieChartIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, Card, Badge, Input, Modal, Select } from "@/src/components/ui/Base";
import { cn, formatCurrency, formatDate } from "@/src/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from "recharts";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/src/lib/supabase";
import { User } from "@supabase/supabase-js";

// --- Mock Data ---
const MOCK_OS = [
  { 
    id: "1", 
    title: "Manutenção Ar Condicionado", 
    client: "João Silva", 
    tech: "João Silva",
    address: "Rua das Flores, 123", 
    status: "agendado", 
    priority: "alta", 
    date: "2026-03-31T09:00:00Z", 
    value: 250.00, 
    technicianId: "t1",
    mapPos: { top: "35%", left: "40%" },
    materials: [
      { name: "Gás Refrigerante", quantity: 1.5, unit: "kg" },
      { name: "Filtro de Ar", quantity: 1, unit: "un" }
    ],
    history: [
      { status: "aberto", date: "2026-03-30T10:00:00Z", user: "Admin" },
      { status: "agendado", date: "2026-03-30T14:30:00Z", user: "Admin" }
    ]
  },
  { 
    id: "2", 
    title: "Reparo Elétrico Residencial", 
    client: "Maria Oliveira", 
    tech: "Carlos Mendes",
    address: "Av. Brasil, 456", 
    status: "em_execucao", 
    priority: "urgente", 
    date: "2026-03-31T10:30:00Z", 
    value: 450.00, 
    technicianId: "t2",
    mapPos: { top: "60%", left: "25%" },
    materials: [
      { name: "Cabo Flexível 2.5mm", quantity: 10, unit: "m" },
      { name: "Disjuntor 20A", quantity: 1, unit: "un" }
    ],
    history: [
      { status: "aberto", date: "2026-03-31T08:00:00Z", user: "Admin" },
      { status: "agendado", date: "2026-03-31T09:00:00Z", user: "Admin" },
      { status: "em_execucao", date: "2026-03-31T10:30:00Z", user: "Técnico" }
    ]
  },
  { 
    id: "3", 
    title: "Instalação de Câmeras", 
    client: "Condomínio Solar", 
    address: "Rua do Sol, 789", 
    status: "aberto", 
    priority: "media", 
    date: "2026-04-01T14:00:00Z", 
    value: 1200.00, 
    technicianId: "t1",
    mapPos: { top: "45%", left: "70%" },
    materials: [],
    history: [
      { status: "aberto", date: "2026-03-31T15:00:00Z", user: "Admin" }
    ]
  },
  { 
    id: "4", 
    title: "Troca de Disjuntor", 
    client: "Pedro Santos", 
    address: "Rua da Paz, 10", 
    status: "concluido", 
    priority: "baixa", 
    date: "2026-03-30T16:00:00Z", 
    value: 150.00, 
    technicianId: "t3",
    mapPos: { top: "75%", left: "55%" },
    materials: [
      { name: "Disjuntor 32A", quantity: 1, unit: "un" }
    ],
    history: [
      { status: "aberto", date: "2026-03-30T14:00:00Z", user: "Admin" },
      { status: "agendado", date: "2026-03-30T15:00:00Z", user: "Admin" },
      { status: "em_execucao", date: "2026-03-30T15:30:00Z", user: "Técnico" },
      { status: "concluido", date: "2026-03-30T16:00:00Z", user: "Técnico" }
    ]
  },
];

const MOCK_TECHNICIANS = [
  { id: "t1", name: "João Silva", specialty: "HVAC / Refrigeração", status: "em_servico", phone: "(11) 98765-4321" },
  { id: "t2", name: "Pedro Santos", specialty: "Eletricista Residencial", status: "deslocando", phone: "(11) 91234-5678" },
  { id: "t3", name: "Maria Oliveira", specialty: "Segurança Eletrônica", status: "disponivel", phone: "(11) 97777-8888" },
];

const MOCK_INVENTORY = [
  { id: "1", name: "Cabo Flexível 2.5mm", category: "Elétrica", quantity: 150, unit: "m", cost: 2.50 },
  { id: "2", name: "Disjuntor Monopolar 20A", category: "Elétrica", quantity: 45, unit: "un", cost: 12.80 },
  { id: "3", name: "Gás Refrigerante R410A", category: "HVAC", quantity: 12, unit: "kg", cost: 85.00 },
  { id: "4", name: "Câmera IP Bullet 1080p", category: "Segurança", quantity: 8, unit: "un", cost: 145.00 },
];

const REVENUE_DATA = [
  { name: "Seg", valor: 1200 },
  { name: "Ter", valor: 1900 },
  { name: "Qua", valor: 1500 },
  { name: "Qui", valor: 2100 },
  { name: "Sex", valor: 2500 },
  { name: "Sáb", valor: 1800 },
  { name: "Dom", valor: 800 },
];

const TECH_PERFORMANCE = [
  { name: "João", tempo: 45 },
  { name: "Pedro", tempo: 38 },
  { name: "Maria", tempo: 52 },
  { name: "Carlos", tempo: 41 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

// --- Components ---

const OSMapView = ({ orders }: { orders: any[] }) => {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [techFilter, setTechFilter] = React.useState<string>("all");

  const filteredMapOrders = orders.filter(os => {
    const matchesStatus = statusFilter === "all" || os.status === statusFilter;
    const matchesTech = techFilter === "all" || os.technicianId === techFilter;
    return matchesStatus && matchesTech;
  });

  return (
    <Card className="h-[calc(100vh-280px)] overflow-hidden relative bg-slate-50 border-none shadow-inner">
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-200 flex gap-2">
          <Select 
            className="h-8 text-[10px] w-32" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos Status</option>
            <option value="aberto">Aberto</option>
            <option value="agendado">Agendado</option>
            <option value="em_execucao">Em Execução</option>
          </Select>
          <Select 
            className="h-8 text-[10px] w-32" 
            value={techFilter} 
            onChange={(e) => setTechFilter(e.target.value)}
          >
            <option value="all">Todos Técnicos</option>
            {MOCK_TECHNICIANS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center opacity-20">
          <MapPin size={120} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-2xl font-bold text-slate-400">Mapa de Clientes</h3>
        </div>
      </div>

      {filteredMapOrders.map((os, idx) => (
        <motion.div
          key={os.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 cursor-pointer group"
          style={{ 
            top: os.mapPos?.top || "50%", 
            left: os.mapPos?.left || "50%" 
          }}
        >
          <div className={cn(
            "h-8 w-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white",
            os.status === "concluido" ? "bg-emerald-500" : 
            os.status === "em_execucao" ? "bg-amber-500" : "bg-blue-500"
          )}>
            <MapPin size={14} />
          </div>
          
          <div className="absolute bottom-full mb-2 hidden group-hover:block z-30">
            <Card className="p-3 shadow-xl border-none bg-white w-48">
              <p className="text-xs font-bold text-slate-900">{os.title}</p>
              <p className="text-[10px] text-slate-500 mt-1">{os.client}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant={os.status === "concluido" ? "success" : "warning"} className="text-[8px]">
                  {os.status.toUpperCase()}
                </Badge>
                <span className="text-[8px] text-slate-400">
                  {MOCK_TECHNICIANS.find(t => t.id === os.technicianId)?.name}
                </span>
              </div>
            </Card>
          </div>
        </motion.div>
      ))}
    </Card>
  );
};

const NotificationDropdown = ({ notifications, onClose, onMarkAsRead }: { notifications: any[], onClose: () => void, onMarkAsRead: (id: string) => void }) => (
  <Card className="absolute right-0 top-full mt-2 w-80 overflow-hidden shadow-2xl z-50 border-none">
    <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
      <h5 className="font-bold text-sm">Notificações</h5>
      <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
    </div>
    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">Nenhuma notificação nova</div>
      ) : (
        notifications.map(notif => (
          <div 
            key={notif.id} 
            className={cn(
              "p-4 hover:bg-slate-50 transition-colors cursor-pointer",
              !notif.read ? "bg-emerald-50/50" : ""
            )}
            onClick={() => onMarkAsRead(notif.id)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-1 h-2 w-2 rounded-full shrink-0",
                notif.type === "success" ? "bg-emerald-500" : 
                notif.type === "warning" ? "bg-amber-500" : 
                notif.type === "error" ? "bg-red-500" : "bg-blue-500"
              )}></div>
              <div>
                <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                <p className="text-[8px] text-slate-400 mt-2">{formatDate(notif.timestamp)}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
      <button className="text-[10px] font-bold text-emerald-600 hover:underline">Ver todas as notificações</button>
    </div>
  </Card>
);

const TechnicianMap = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [technicians, setTechnicians] = React.useState([
    { id: 1, name: "João Silva", status: "Em serviço", pos: { top: "25%", left: "30%" }, color: "emerald" },
    { id: 2, name: "Pedro Santos", status: "Deslocando", pos: { top: "55%", left: "45%" }, color: "blue" },
    { id: 3, name: "Maria Oliveira", status: "Disponível", pos: { top: "40%", left: "75%" }, color: "slate" },
    { id: 4, name: "Carlos Lima", status: "Urgência", pos: { top: "70%", left: "20%" }, color: "red" },
  ]);

  // Simulate real-time movement
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTechnicians(prev => prev.map(tech => ({
        ...tech,
        pos: {
          top: `${Math.max(10, Math.min(90, parseFloat(tech.pos.top) + (Math.random() - 0.5) * 1.5))}%`,
          left: `${Math.max(10, Math.min(90, parseFloat(tech.pos.left) + (Math.random() - 0.5) * 1.5))}%`,
        }
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredTechs = technicians.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-[calc(100vh-180px)] overflow-hidden relative bg-slate-50 border-none shadow-inner">
      {/* Map Search Overlay */}
      <div className="absolute top-6 left-6 z-30 w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Buscar técnico..." 
            className="pl-10 bg-white/90 backdrop-blur-sm shadow-lg border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Map Background Placeholder - Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center opacity-20">
          <MapIcon size={160} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-3xl font-bold text-slate-400">FieldFlow Live Map</h3>
        </div>
      </div>

      {/* Animated Markers */}
      {filteredTechs.map(tech => (
        <motion.div
          key={tech.id}
          animate={{ top: tech.pos.top, left: tech.pos.left }}
          transition={{ duration: 4, ease: "linear" }}
          className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
        >
          <div className={cn(
            "absolute h-full w-full rounded-full animate-ping opacity-20",
            tech.color === "emerald" ? "bg-emerald-500" : 
            tech.color === "blue" ? "bg-blue-500" : 
            tech.color === "red" ? "bg-red-500" : "bg-slate-500"
          )}></div>
          <div className={cn(
            "relative h-5 w-5 rounded-full border-2 border-white shadow-lg transition-all duration-500",
            searchTerm && tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ? "scale-150 ring-4 ring-emerald-500/30" : "",
            tech.color === "emerald" ? "bg-emerald-600" : 
            tech.color === "blue" ? "bg-blue-600" : 
            tech.color === "red" ? "bg-red-600" : "bg-slate-600"
          )}></div>
          <div className={cn(
            "absolute top-full mt-1 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold shadow-md border text-slate-900 transition-all",
            searchTerm && tech.name.toLowerCase().includes(searchTerm.toLowerCase()) 
              ? "bg-emerald-600 text-white border-emerald-700 scale-110" 
              : "bg-white border-slate-100"
          )}>
            {tech.name}
          </div>
        </motion.div>
      ))}

      {/* Sidebar Overlay */}
      <div className="absolute top-6 right-6 w-72 space-y-4 z-30">
        <Card className="p-4 shadow-2xl border-none bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold text-sm">Técnicos em Campo</h5>
            <Badge variant="outline" className="text-[10px]">{filteredTechs.length} Online</Badge>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {filteredTechs.map(tech => (
              <div key={tech.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full", 
                    tech.color === "emerald" ? "bg-emerald-500" : 
                    tech.color === "blue" ? "bg-blue-500" : 
                    tech.color === "red" ? "bg-red-500" : "bg-slate-500"
                  )}></div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                    <p className="text-[10px] text-slate-500">{tech.status}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4 text-[10px] h-8">Ver Relatório de Rotas</Button>
        </Card>

        <Card className="p-4 shadow-2xl border-none bg-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[10px] font-medium opacity-80">Otimização de Rota</p>
              <p className="text-lg font-bold">94.2%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-2xl border-none bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium opacity-80">Alertas de Atraso</p>
              <p className="text-lg font-bold">02</p>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: { icon: any, label: string, active?: boolean, onClick: () => void, collapsed?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
      active ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      collapsed && "justify-center px-0"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={20} />
    {!collapsed && <span>{label}</span>}
  </button>
);

const MOCK_OS_STATS = [
  { name: "Seg", concluidas: 12, pendentes: 4 },
  { name: "Ter", concluidas: 15, pendentes: 2 },
  { name: "Qua", concluidas: 10, pendentes: 6 },
  { name: "Qui", concluidas: 18, pendentes: 3 },
  { name: "Sex", concluidas: 14, pendentes: 5 },
];

const OSCard = ({ os, onClick }: any) => (
  <Card 
    className="p-5 hover:shadow-md transition-shadow cursor-pointer border-slate-200"
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-4">
      <Badge variant={os.priority === "urgente" ? "destructive" : "secondary"}>
        {os.priority.toUpperCase()}
      </Badge>
      <span className="text-xs font-medium text-slate-400">#{os.id}</span>
    </div>
    <h4 className="font-bold text-slate-900 mb-1">{os.title}</h4>
    <p className="text-sm text-slate-500 mb-4">{os.client}</p>
    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock size={14} />
        <span>{formatDate(os.date)}</span>
      </div>
      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
        {os.client[0]}
      </div>
    </div>
  </Card>
);

const StatCard = ({ title, value, icon: Icon, trend, color = "emerald" }: { title: string, value: string, icon: any, trend?: string, color?: string }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <p className={cn("mt-2 text-xs font-medium", trend.startsWith("+") ? "text-emerald-600" : "text-red-600")}>
            {trend} em relação ao mês anterior
          </p>
        )}
      </div>
      <div className={cn("rounded-xl p-3", `bg-${color}-100 text-${color}-600`)}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [view, setView] = React.useState<"login" | "admin" | "technician" | "manager">("login");
  const [adminTab, setAdminTab] = React.useState<"dashboard" | "os" | "map" | "clients" | "inventory" | "reports">("dashboard");
  const [managerTab, setManagerTab] = React.useState<"dashboard" | "os" | "reports">("dashboard");
  const [techTab, setTechTab] = React.useState<"list" | "execution">("list");
  const [selectedOS, setSelectedOS] = React.useState<any>(null);
  const [selectedClient, setSelectedClient] = React.useState<any>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = React.useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // --- New States ---
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [osViewMode, setOsViewMode] = React.useState<"list" | "map">("list");
  const [dateFilter, setDateFilter] = React.useState({ start: "", end: "" });
  const [inventorySort, setInventorySort] = React.useState<{ key: string, direction: "asc" | "desc" }>({ key: "name", direction: "asc" });
  const [deleteModal, setDeleteModal] = React.useState<{ isOpen: boolean, type: "os" | "client", id: string | null }>({ isOpen: false, type: "os", id: null });
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [technicianLocations, setTechnicianLocations] = React.useState<Record<string, { lat: number, lng: number, name: string }>>({
    "tech1": { lat: -23.5505, lng: -46.6333, name: "João Silva" },
    "tech2": { lat: -23.5555, lng: -46.6400, name: "Maria Oliveira" }
  });
  const [clientSignatureInfo, setClientSignatureInfo] = React.useState({ name: "", documentId: "", timestamp: "" });

  const signatureRef = React.useRef<SignatureCanvas>(null);

  // --- Supabase Auth Session ---
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = session.user.user_metadata?.role || "admin";
        setView(role as any);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = session.user.user_metadata?.role || "admin";
        setView(role as any);
      } else {
        setView("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Auto-save Simulation ---
  React.useEffect(() => {
    if (!selectedOS && !selectedClient && !selectedInventoryItem) return;
    
    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      setSaveStatus("saved");
      const idleTimeout = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(idleTimeout);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [selectedOS, selectedClient, selectedInventoryItem]);

  // --- GPS Tracking Simulation ---
  React.useEffect(() => {
    if (view !== "admin" && view !== "manager") return;

    const interval = setInterval(() => {
      setTechnicianLocations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = {
            ...next[id],
            lat: next[id].lat + (Math.random() - 0.5) * 0.001,
            lng: next[id].lng + (Math.random() - 0.5) * 0.001,
          };
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [view]);

  // --- Real-time Notifications Simulation ---
  React.useEffect(() => {
    if (view !== "admin" && view !== "manager") return;

    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.7) {
        const isUrgent = random > 0.9;
        const newNotif = {
          id: Date.now().toString(),
          title: isUrgent ? "🚨 ORDEM URGENTE" : (random > 0.85 ? "Nova Ordem de Serviço" : "Atualização de Status"),
          message: isUrgent 
            ? "ALERTA: OS Crítica criada para o cliente Hospital Central!" 
            : (random > 0.85 
              ? "Uma nova OS foi criada para o cliente Condomínio Solar." 
              : "O técnico João Silva iniciou o deslocamento para a OS #2."),
          type: isUrgent ? "error" : (random > 0.85 ? "success" : "info"),
          timestamp: new Date().toISOString(),
          read: false,
          urgent: isUrgent
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [view]);

  const handleLogin = async (role: "admin" | "technician" | "manager") => {
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
            }
          }
        });
        if (error) throw error;
        alert("Cadastro realizado! Verifique seu e-mail (se habilitado) ou faça login.");
        setAuthMode("login");
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("login");
    setSelectedOS(null);
    setNotifications([]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredOS = MOCK_OS.filter(os => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      os.title.toLowerCase().includes(search) ||
      os.client.toLowerCase().includes(search) ||
      os.address.toLowerCase().includes(search) ||
      os.id.toLowerCase().includes(search)
    );

    const osDate = new Date(os.date).getTime();
    const start = dateFilter.start ? new Date(dateFilter.start).getTime() : 0;
    const end = dateFilter.end ? new Date(dateFilter.end).getTime() : Infinity;
    const matchesDate = osDate >= start && osDate <= end;

    return matchesSearch && matchesDate;
  });

  const sortedInventory = [...MOCK_INVENTORY].sort((a: any, b: any) => {
    const valA = inventorySort.key === "total" ? a.quantity * a.cost : a[inventorySort.key];
    const valB = inventorySort.key === "total" ? b.quantity * b.cost : b[inventorySort.key];
    
    if (valA < valB) return inventorySort.direction === "asc" ? -1 : 1;
    if (valA > valB) return inventorySort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const toggleInventorySort = (key: string) => {
    setInventorySort(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleDeleteClick = (type: "os" | "client", id: string) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const confirmDelete = () => {
    console.log(`Excluindo ${deleteModal.type} com ID: ${deleteModal.id}`);
    setDeleteModal({ isOpen: false, type: "os", id: null });
    // In a real app, we would update state or call an API here
  };

  const generatePDF = async () => {
    if (!selectedOS) return;
    const element = document.getElementById("os-report");
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Relatorio-OS-${selectedOS.id}.pdf`);
  };

  const generateLowStockPDF = () => {
    const lowStockItems = MOCK_INVENTORY.filter(item => item.quantity < 10);
    const pdf = new jsPDF();
    
    pdf.setFontSize(18);
    pdf.text("Relatório de Baixo Estoque", 14, 22);
    
    pdf.setFontSize(11);
    pdf.setTextColor(100);
    pdf.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    
    let y = 45;
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.text("Item", 14, y);
    pdf.text("Qtd", 100, y);
    pdf.text("Custo Unit.", 130, y);
    pdf.text("Total", 170, y);
    
    pdf.line(14, y + 2, 196, y + 2);
    y += 10;

    lowStockItems.forEach(item => {
      pdf.text(item.name, 14, y);
      pdf.text(`${item.quantity} ${item.unit}`, 100, y);
      pdf.text(formatCurrency(item.cost), 130, y);
      pdf.text(formatCurrency(item.quantity * item.cost), 170, y);
      y += 8;
    });

    const totalValue = lowStockItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
    pdf.line(14, y, 196, y);
    y += 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Valor Total em Baixo Estoque:", 14, y);
    pdf.text(formatCurrency(totalValue), 170, y);

    pdf.save("relatorio-baixo-estoque.pdf");
  };

  const ReportsView = () => {
  const [reportType, setReportType] = React.useState<"os" | "tech" | "client">("os");
  const [dateRange, setDateRange] = React.useState({ start: "2026-03-01", end: "2026-03-31" });
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [reportData, setReportData] = React.useState<any>(null);

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReportData({
        generatedAt: new Date().toLocaleString(),
        type: reportType,
        period: `${dateRange.start} até ${dateRange.end}`,
        filters: {
          status: statusFilter === "all" ? "Todos" : statusFilter.toUpperCase()
        },
        summary: {
          total: 156,
          completed: 124,
          pending: 32,
          revenue: "R$ 45.890,00"
        },
        items: [
          { id: "1", label: "Manutenção Preventiva", count: 45, value: "R$ 12.000" },
          { id: "2", label: "Instalação de Ar", count: 32, value: "R$ 15.400" },
          { id: "3", label: "Reparo Elétrico", count: 28, value: "R$ 8.200" },
          { id: "4", label: "Vistoria Técnica", count: 51, value: "R$ 10.290" },
        ]
      });
      setIsGenerating(false);
    }, 1500);
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text("Relatório FieldFlow", 14, 22);
    pdf.setFontSize(12);
    pdf.text(`Tipo: ${reportType.toUpperCase()}`, 14, 32);
    pdf.text(`Período: ${dateRange.start} a ${dateRange.end}`, 14, 40);
    
    let y = 60;
    pdf.setFont("helvetica", "bold");
    pdf.text("Resumo Geral", 14, y);
    y += 10;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Total de OS: ${reportData.summary.total}`, 14, y);
    pdf.text(`Concluídas: ${reportData.summary.completed}`, 14, y + 8);
    pdf.text(`Faturamento: ${reportData.summary.revenue}`, 14, y + 16);
    
    y += 40;
    pdf.setFont("helvetica", "bold");
    pdf.text("Detalhamento por Categoria", 14, y);
    y += 10;
    pdf.setFont("helvetica", "normal");
    reportData.items.forEach((item: any) => {
      pdf.text(`${item.label}: ${item.count} unidades - ${item.value}`, 14, y);
      y += 8;
    });

    pdf.save(`relatorio-${reportType}-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Configurar Relatório</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Tipo de Relatório</label>
            <Select 
              className="mt-1" 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value as any)}
            >
              <option value="os">Ordens de Serviço</option>
              <option value="tech">Desempenho de Técnicos</option>
              <option value="client">Atividade por Cliente</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Status</label>
            <Select 
              className="mt-1" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={reportType !== "os"}
            >
              <option value="all">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="em_execucao">Em Execução</option>
              <option value="concluido">Concluído</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Data Início</label>
            <Input 
              type="date" 
              className="mt-1" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">Data Fim</label>
            <Input 
              type="date" 
              className="mt-1" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>
      </Card>

      {reportData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Relatório de {reportType === "os" ? "Ordens de Serviço" : reportType === "tech" ? "Técnicos" : "Clientes"}</h2>
                <p className="text-slate-500">Gerado em {reportData.generatedAt}</p>
              </div>
              <Button variant="outline" onClick={exportPDF} className="gap-2">
                <Download size={18} /> Exportar PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Total de OS</p>
                <p className="text-2xl font-bold text-slate-900">{reportData.summary.total}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-bold uppercase text-emerald-600">Concluídas</p>
                <p className="text-2xl font-bold text-emerald-700">{reportData.summary.completed}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold uppercase text-amber-600">Pendentes</p>
                <p className="text-2xl font-bold text-amber-700">{reportData.summary.pending}</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-bold uppercase text-indigo-600">Faturamento</p>
                <p className="text-2xl font-bold text-indigo-700">{reportData.summary.revenue}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Detalhamento</h4>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500">Categoria / Nome</th>
                      <th className="px-6 py-4 font-bold text-slate-500 text-right">Quantidade</th>
                      <th className="px-6 py-4 font-bold text-slate-500 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.items.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.label}</td>
                        <td className="px-6 py-4 text-right text-slate-600">{item.count}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// --- Views ---

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (view === "login" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl">
              <ClipboardList size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">FieldFlow</h1>
            <p className="mt-2 text-slate-500">Gestão inteligente para equipes de campo</p>
          </div>

          <Card className="p-8">
            <div className="space-y-4">
              {authError && (
                <div className="p-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {authError}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700">E-mail</label>
                <Input 
                  type="email" 
                  placeholder="exemplo@fieldflow.com" 
                  className="mt-1" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="mt-1" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {authMode === "login" ? (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => handleLogin("admin")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar como Administrador"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleLogin("manager")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar como Gerente"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => handleLogin("technician")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar como Técnico"}
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin("admin")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Criar Conta"}
                </Button>
              )}
            </div>
            
            <div className="mt-6 text-center space-y-2">
              <button 
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-sm font-medium text-emerald-600 hover:underline block w-full"
              >
                {authMode === "login" ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
              </button>
              <a href="#" className="text-sm font-medium text-slate-400 hover:underline block">Esqueceu sua senha?</a>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (view === "manager") {
    return (
      <div className="flex h-screen bg-slate-50">
        <aside className={cn(
          "hidden h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex",
          isSidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ClipboardList size={18} />
            </div>
            {isSidebarOpen && <span className="font-bold text-slate-900">FieldFlow <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">GERENTE</span></span>}
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={managerTab === "dashboard"} 
              onClick={() => setManagerTab("dashboard")} 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              icon={FileText} 
              label="Ordens de Serviço" 
              active={managerTab === "os"} 
              onClick={() => setManagerTab("os")} 
              collapsed={!isSidebarOpen}
            />
            <SidebarItem 
              icon={PieChartIcon} 
              label="Relatórios" 
              active={managerTab === "reports"} 
              onClick={() => setManagerTab("reports")} 
              collapsed={!isSidebarOpen}
            />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <SidebarItem icon={LogOut} label="Sair" onClick={handleLogout} collapsed={!isSidebarOpen} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex">
                <Menu size={20} />
              </Button>
              <h2 className="text-lg font-semibold text-slate-800">
                {managerTab === "dashboard" && "Dashboard Gerencial"}
                {managerTab === "os" && "Gestão de Ordens"}
                {managerTab === "reports" && "Relatórios Customizados"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-slate-500">Gerente</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            {managerTab === "dashboard" && (
              <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="OS Pendentes" value="12" icon={Clock} color="amber" />
          <StatCard title="OS em Execução" value="5" icon={Activity} color="blue" />
          <StatCard title="OS Concluídas" value="48" icon={CheckCircle2} color="emerald" />
          <StatCard title="Faturamento" value="R$ 12.450" icon={TrendingUp} color="indigo" />
        </div>
                <Card className="p-6">
                  <h3 className="mb-6 text-lg font-bold text-slate-900">Desempenho da Equipe</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_OS_STATS}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                          cursor={{fill: '#f8fafc'}}
                        />
                        <Bar dataKey="concluidas" name="Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pendentes" name="Pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}

            {managerTab === "os" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Buscar por cliente, técnico ou serviço..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {MOCK_OS.filter(os => 
                    os.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    os.tech.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(os => (
                    <OSCard key={os.id} os={os} onClick={() => setSelectedOS(os)} />
                  ))}
                </div>
              </div>
            )}

            {managerTab === "reports" && <ReportsView />}
          </div>
        </main>
      </div>
    );
  }

  if (view === "admin") {
    return (
      <div className="flex h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex",
          isSidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ClipboardList size={18} />
            </div>
            {isSidebarOpen && <span className="text-lg font-bold text-slate-900">FieldFlow</span>}
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={adminTab === "dashboard"} onClick={() => setAdminTab("dashboard")} />
            <SidebarItem icon={ClipboardList} label="Ordens de Serviço" active={adminTab === "os"} onClick={() => setAdminTab("os")} />
            <SidebarItem icon={MapIcon} label="Mapa em Tempo Real" active={adminTab === "map"} onClick={() => setAdminTab("map")} />
            <SidebarItem icon={PieChartIcon} label="Relatórios" active={adminTab === "reports"} onClick={() => setAdminTab("reports")} />
            
            {/* Role-based Permissions: Only Admin sees Clients and Inventory */}
            {view === "admin" && (
              <>
                <SidebarItem icon={Users} label="Clientes" active={adminTab === "clients"} onClick={() => setAdminTab("clients")} />
                <SidebarItem icon={Package} label="Estoque" active={adminTab === "inventory"} onClick={() => setAdminTab("inventory")} />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <SidebarItem icon={LogOut} label="Sair" onClick={handleLogout} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block text-slate-500 hover:text-slate-900">
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                {adminTab === "dashboard" && "Painel de Controle"}
                {adminTab === "os" && "Ordens de Serviço"}
                {adminTab === "map" && "Mapa de Equipes"}
                {adminTab === "reports" && "Relatórios Customizados"}
                {adminTab === "clients" && "Gestão de Clientes"}
                {adminTab === "inventory" && "Controle de Estoque"}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  placeholder="Buscar OS, Cliente ou Endereço..." 
                  className="w-80 pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
                  )}
                </Button>
                {isNotificationsOpen && (
                  <NotificationDropdown 
                    notifications={notifications} 
                    onClose={() => setIsNotificationsOpen(false)}
                    onMarkAsRead={markNotificationAsRead}
                  />
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {view === "admin" ? "AD" : "TC"}
              </div>
            </div>
          </header>

          <div className="p-6">
            {adminTab === "reports" && <ReportsView />}
            {adminTab === "map" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  <Card className="lg:col-span-3 h-[600px] relative overflow-hidden bg-slate-100 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover opacity-20 grayscale"></div>
                    <div className="relative z-10 w-full h-full p-8">
                      {/* Simulated Map Markers */}
                      {Object.entries(technicianLocations).map(([id, loc]: [string, any]) => (
                        <motion.div 
                          key={id}
                          className="absolute flex flex-col items-center"
                          animate={{ 
                            left: `${50 + (loc.lng + 46.6333) * 1000}%`, 
                            top: `${50 - (loc.lat + 23.5505) * 1000}%` 
                          }}
                          transition={{ type: "spring", stiffness: 50 }}
                        >
                          <div className="bg-white px-2 py-1 rounded shadow-lg text-[10px] font-bold mb-1 whitespace-nowrap border border-slate-200">
                            {loc.name}
                          </div>
                          <div className="h-4 w-4 rounded-full bg-emerald-600 border-2 border-white shadow-lg animate-pulse"></div>
                        </motion.div>
                      ))}
                      
                      {/* Client Markers */}
                      {MOCK_OS.map(os => (
                        <div 
                          key={os.id}
                          className="absolute flex flex-col items-center opacity-60"
                          style={{ 
                            left: `${40 + Math.random() * 20}%`, 
                            top: `${40 + Math.random() * 20}%` 
                          }}
                        >
                          <div className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                        <span className="font-medium">Técnicos em Campo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium">Ordens Pendentes</span>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900">Equipe Ativa</h4>
                    {Object.entries(technicianLocations).map(([id, loc]: [string, any]) => (
                      <Card key={id} className="p-4 hover:border-emerald-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <UserIcon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{loc.name}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin size={10} /> {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                            </p>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {adminTab === "dashboard" && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard title="Receita Mensal" value="R$ 42.500" icon={DollarSign} trend="+12.5%" />
                  <StatCard title="OS Concluídas" value="156" icon={CheckCircle2} trend="+8.2%" color="blue" />
                  <StatCard title="Técnicos Ativos" value="12" icon={Users} trend="+2" color="amber" />
                  <StatCard title="Tempo Médio" value="42 min" icon={Clock} trend="-5 min" color="slate" />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <Card className="p-6">
                    <h4 className="mb-6 text-lg font-semibold text-slate-900">Faturamento Semanal</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                            cursor={{ fill: "#f8fafc" }}
                          />
                          <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="mb-6 text-lg font-semibold text-slate-900">Performance por Técnico (min)</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={TECH_PERFORMANCE}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="tempo"
                          >
                            {TECH_PERFORMANCE.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Recent OS Table */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <h4 className="font-semibold text-slate-900">Ordens Recentes</h4>
                    <Button variant="outline" size="sm">Ver Todas</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500">
                          <th className="px-6 py-4 font-medium">ID</th>
                          <th className="px-6 py-4 font-medium">Serviço</th>
                          <th className="px-6 py-4 font-medium">Cliente</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Valor</th>
                          <th className="px-6 py-4 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOS.map((os) => (
                          <tr key={os.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">#{os.id}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{os.title}</td>
                            <td className="px-6 py-4 text-slate-600">{os.client}</td>
                            <td className="px-6 py-4">
                              <Badge variant={os.status === "concluido" ? "success" : os.status === "em_execucao" ? "warning" : "default"}>
                                {os.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(os.value)}</td>
                            <td className="px-6 py-4">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedOS(os); setAdminTab("os"); }}>Detalhes</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {adminTab === "os" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                      <button 
                        onClick={() => setOsViewMode("list")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                          osViewMode === "list" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        Lista
                      </button>
                      <button 
                        onClick={() => setOsViewMode("map")}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                          osViewMode === "map" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        Mapa
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1 border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Período:</span>
                      <input 
                        type="date" 
                        className="text-xs border-none focus:ring-0 bg-transparent"
                        value={dateFilter.start}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                      />
                      <span className="text-slate-300">|</span>
                      <input 
                        type="date" 
                        className="text-xs border-none focus:ring-0 bg-transparent"
                        value={dateFilter.end}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>

                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setDateFilter({ start: "", end: "" })}>
                      Limpar Filtros
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                      <FileText size={18} /> Exportar PDF
                    </Button>
                    <Button className="gap-2">
                      <Plus size={18} /> Nova OS
                    </Button>
                  </div>
                </div>

                {osViewMode === "list" ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* OS List */}
                    <div className="lg:col-span-1 space-y-4">
                      {filteredOS.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                          Nenhuma ordem encontrada para "{searchTerm}"
                        </div>
                      ) : (
                        filteredOS.map((os) => (
                          <Card 
                            key={os.id} 
                            className={cn(
                              "cursor-pointer p-4 transition-all hover:shadow-md",
                              selectedOS?.id === os.id ? "ring-2 ring-emerald-500" : ""
                            )}
                            onClick={() => setSelectedOS(os)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant={os.priority === "urgente" ? "destructive" : "default"} className="mb-2">
                                  {os.priority.toUpperCase()}
                                </Badge>
                                <h5 className="font-bold text-slate-900">{os.title}</h5>
                                <p className="text-xs text-slate-500 mt-1">{os.client}</p>
                              </div>
                              <ChevronRight size={16} className="text-slate-300" />
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(os.date)}</span>
                              <span className="font-bold text-slate-900">{formatCurrency(os.value)}</span>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>

                    {/* OS Detail View */}
                    <div className="lg:col-span-2">
                      {selectedOS ? (
                        <Card className="p-8" id="os-report">
                          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                            <div>
                              <h3 className="text-2xl font-bold text-slate-900">{selectedOS.title}</h3>
                              <p className="text-slate-500">OS #{selectedOS.id} • Gerada em {formatDate(selectedOS.date)}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={selectedOS.status === "concluido" ? "success" : "warning"} className="text-sm px-4 py-1">
                                {selectedOS.status.toUpperCase()}
                              </Badge>
                              <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(selectedOS.value)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8 py-8">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cliente</h4>
                              <p className="font-bold text-slate-900">{selectedOS.client}</p>
                              <p className="text-sm text-slate-600 mt-1">{selectedOS.address}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Técnico Responsável</h4>
                              {(() => {
                                const tech = MOCK_TECHNICIANS.find(t => t.id === selectedOS.technicianId);
                                return tech ? (
                                  <div>
                                    <p className="font-bold text-slate-900">{tech.name}</p>
                                    <p className="text-sm text-slate-600 mt-1">{tech.specialty}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        tech.status === "disponivel" ? "bg-emerald-500" : 
                                        tech.status === "em_servico" ? "bg-amber-500" : "bg-blue-500"
                                      )}></div>
                                      <span className="text-[10px] font-medium text-slate-500 uppercase">{tech.status.replace("_", " ")}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400 italic">Não atribuído</p>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Materiais Utilizados</h4>
                              {selectedOS.materials && selectedOS.materials.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {selectedOS.materials.map((mat: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                      <span className="text-sm font-medium text-slate-700">{mat.name}</span>
                                      <Badge variant="outline" className="bg-white">{mat.quantity} {mat.unit}</Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">Nenhum material registrado para esta ordem.</p>
                              )}
                            </div>

                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Histórico de Status</h4>
                              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {selectedOS.history && selectedOS.history.map((h: any, i: number) => (
                                  <div key={i} className="relative pl-8">
                                    <div className={cn(
                                      "absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                                      i === selectedOS.history.length - 1 ? "bg-emerald-500" : "bg-slate-300"
                                    )}></div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-bold text-slate-900">{h.status.replace("_", " ").toUpperCase()}</p>
                                      <span className="text-[10px] text-slate-400">{formatDate(h.date)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Atualizado por {h.user}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Evidências do Serviço</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200">
                                  <span className="text-xs text-slate-400 font-medium">Foto Antes</span>
                                </div>
                                <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200">
                                  <span className="text-xs text-slate-400 font-medium">Foto Depois</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Assinatura do Cliente</h4>
                              <div className="h-32 w-64 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                                <span className="text-xs text-slate-300 italic">Assinatura Digital</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex justify-between items-center no-print border-t border-slate-100 pt-6">
                            <Button 
                              variant="ghost" 
                              className="text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
                              onClick={() => handleDeleteClick("os", selectedOS.id)}
                            >
                              Excluir Ordem
                            </Button>
                            <div className="flex gap-3">
                              <Button variant="outline" onClick={generatePDF}>Baixar PDF</Button>
                              <Button>Enviar para Cliente</Button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                          <div>
                            <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Selecione uma Ordem de Serviço</h3>
                            <p className="text-slate-500">Clique em uma OS na lista ao lado para ver os detalhes completos.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <OSMapView orders={filteredOS.filter(os => os.status !== "concluido")} />
                )}
              </div>
            )}

            {adminTab === "map" && (
              <TechnicianMap />
            )}

            {adminTab === "clients" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Gestão de Clientes</h3>
                  <Button className="gap-2" onClick={() => setSelectedClient({ id: "new", name: "", email: "", phone: "" })}>
                    <Plus size={18} /> Novo Cliente
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-4">
                    {[
                      { id: "1", name: "João Silva", email: "joao@email.com", phone: "(11) 98765-4321" },
                      { id: "2", name: "Maria Oliveira", email: "maria@email.com", phone: "(11) 91234-5678" },
                    ].map((client) => (
                      <Card 
                        key={client.id} 
                        className={cn(
                          "cursor-pointer p-4 transition-all hover:shadow-md",
                          selectedClient?.id === client.id ? "ring-2 ring-emerald-500" : ""
                        )}
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-slate-900">{client.name}</h5>
                            <p className="text-xs text-slate-500 mt-1">{client.email}</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="lg:col-span-2">
                    {selectedClient ? (
                      <Card className="p-8">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                          <h4 className="text-xl font-bold text-slate-900">
                            {selectedClient.id === "new" ? "Novo Cliente" : "Editar Cliente"}
                          </h4>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}><X size={20} /></Button>
                        </div>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="text-xs font-bold uppercase text-slate-400">Nome Completo</label>
                              <Input 
                                className="mt-1" 
                                value={selectedClient.name} 
                                onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-slate-400">E-mail</label>
                              <Input 
                                className="mt-1" 
                                value={selectedClient.email} 
                                onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase text-slate-400">Telefone</label>
                            <Input 
                              className="mt-1" 
                              value={selectedClient.phone} 
                              onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                            />
                          </div>
                          <div className="pt-6 flex justify-between">
                            <Button variant="ghost" className="text-red-500" onClick={() => handleDeleteClick("client", selectedClient.id)}>
                              Excluir Cliente
                            </Button>
                            <Button onClick={() => setSelectedClient(null)}>Salvar Alterações</Button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-12 text-center border-2 border-dashed border-slate-200 bg-white">
                        <Users size={48} className="mx-auto text-slate-200 mb-4" />
                        <h4 className="text-lg font-medium text-slate-900">Selecione um Cliente</h4>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                          Selecione um cliente na lista ao lado para visualizar ou editar suas informações.
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "inventory" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Estoque de Materiais</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={generateLowStockPDF}>
                      <FileText size={18} /> Relatório Baixo Estoque
                    </Button>
                    <Button className="gap-2" onClick={() => setSelectedInventoryItem({ id: "new", name: "", category: "", quantity: 0, unit: "un", cost: 0 })}>
                      <Plus size={18} /> Adicionar Item
                    </Button>
                  </div>
                </div>

                {selectedInventoryItem ? (
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                      <h4 className="text-xl font-bold text-slate-900">
                        {selectedInventoryItem.id === "new" ? "Novo Item de Estoque" : "Editar Item"}
                      </h4>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedInventoryItem(null)}><X size={20} /></Button>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400">Nome do Material</label>
                          <Input 
                            className="mt-1" 
                            value={selectedInventoryItem.name} 
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400">Categoria</label>
                          <Select 
                            className="mt-1" 
                            value={selectedInventoryItem.category}
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, category: e.target.value})}
                          >
                            <option value="">Selecione...</option>
                            <option value="Elétrica">Elétrica</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Segurança">Segurança</option>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400">Quantidade</label>
                          <Input 
                            type="number" 
                            className="mt-1" 
                            value={selectedInventoryItem.quantity} 
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, quantity: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400">Unidade</label>
                          <Input 
                            className="mt-1" 
                            value={selectedInventoryItem.unit} 
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, unit: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400">Custo Unitário (R$)</label>
                          <Input 
                            type="number" 
                            className="mt-1" 
                            value={selectedInventoryItem.cost} 
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, cost: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="pt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSelectedInventoryItem(null)}>Cancelar</Button>
                        <Button onClick={() => setSelectedInventoryItem(null)}>Salvar Alterações</Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-900" onClick={() => toggleInventorySort("name")}>Material</th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-900" onClick={() => toggleInventorySort("category")}>Categoria</th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-900 text-right" onClick={() => toggleInventorySort("quantity")}>Qtd.</th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-900 text-right" onClick={() => toggleInventorySort("cost")}>Custo Unit.</th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-900 text-right" onClick={() => toggleInventorySort("total")}>Valor Total</th>
                            <th className="px-6 py-4 font-medium text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sortedInventory.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                              <td className="px-6 py-4 text-slate-600">{item.category}</td>
                              <td className="px-6 py-4 text-right">
                                <span className={cn(
                                  "font-bold",
                                  item.quantity < 10 ? "text-red-500" : "text-slate-900"
                                )}>
                                  {item.quantity} {item.unit}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-slate-600">{formatCurrency(item.cost)}</td>
                              <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(item.quantity * item.cost)}</td>
                              <td className="px-6 py-4 text-center">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedInventoryItem(item)}>Editar</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Auto-save Indicator */}
        <AnimatePresence>
          {saveStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Card className="px-4 py-2 shadow-2xl border-none bg-slate-900 text-white flex items-center gap-3">
                {saveStatus === "saving" ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    <span className="text-xs font-medium">Salvando alterações...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium">Todas as alterações salvas</span>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          title="Confirmar Exclusão"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Excluir Permanentemente</Button>
            </>
          }
        >
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Você tem certeza?</p>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Esta ação é <span className="font-bold text-red-600">irreversível</span>. 
                Todos os dados vinculados a este {deleteModal.type === "os" ? "registro de ordem de serviço" : "cliente"} serão removidos permanentemente.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (view === "technician") {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <AnimatePresence mode="wait">
          {techTab === "list" ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 pb-24"
            >
              <header className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Olá, João</h1>
                  <p className="text-slate-400 text-sm">Você tem 4 tarefas hoje</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400">
                  <LogOut size={20} />
                </Button>
              </header>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Próximas Tarefas</h3>
                {MOCK_OS.filter(os => os.status !== "concluido").map((os) => (
                  <Card 
                    key={os.id} 
                    className="bg-slate-800 border-slate-700 p-5 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => { setSelectedOS(os); setTechTab("execution"); }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            os.priority === "urgente" ? "bg-red-500" : "bg-emerald-500"
                          )}></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{os.priority}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">{os.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{os.client}</p>
                      </div>
                      <div className="rounded-xl bg-slate-700 p-2 text-emerald-400">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(os.date).split(",")[1]}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {os.address.split(",")[0]}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-12 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Concluídas</h3>
                {MOCK_OS.filter(os => os.status === "concluido").map((os) => (
                  <Card key={os.id} className="bg-slate-800/50 border-slate-700/50 p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-300">{os.title}</h4>
                        <p className="text-xs text-slate-500">{os.client}</p>
                      </div>
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="execution"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-screen"
            >
              <header className="sticky top-0 z-10 bg-slate-900/80 p-4 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
                <button onClick={() => setTechTab("list")} className="flex items-center gap-2 text-slate-400 font-medium">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <Badge variant="warning" className="bg-amber-500/20 text-amber-500 border-none">EM EXECUÇÃO</Badge>
              </header>

              <div className="flex-1 p-6 space-y-8">
                <section>
                  <h2 className="text-3xl font-bold">{selectedOS?.title}</h2>
                  <div className="mt-4 space-y-2">
                    <p className="text-emerald-400 font-bold flex items-center gap-2"><Users size={16} /> {selectedOS?.client}</p>
                    <p className="text-slate-400 text-sm flex items-center gap-2"><MapPin size={16} /> {selectedOS?.address}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Checklist de Segurança</h3>
                  <div className="space-y-3">
                    {["Verificou fiação?", "Equipamento desligado?", "Área isolada?"].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer active:bg-slate-700 transition-colors">
                        <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm font-medium">{item}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Evidências Fotográficas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                      <Camera size={32} />
                      <span className="text-[10px] font-bold uppercase">Foto Antes</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                      <Camera size={32} />
                      <span className="text-[10px] font-bold uppercase">Foto Depois</span>
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Informações do Cliente</h3>
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-800 border border-slate-700">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500">Nome do Recebedor</label>
                      <Input 
                        className="bg-slate-900 border-slate-700 text-white mt-1" 
                        placeholder="Nome completo"
                        value={clientSignatureInfo.name}
                        onChange={(e) => setClientSignatureInfo({...clientSignatureInfo, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500">Documento (CPF/RG)</label>
                      <Input 
                        className="bg-slate-900 border-slate-700 text-white mt-1" 
                        placeholder="000.000.000-00"
                        value={clientSignatureInfo.documentId}
                        onChange={(e) => setClientSignatureInfo({...clientSignatureInfo, documentId: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Assinatura Digital</h3>
                  <div className="rounded-2xl bg-white p-2">
                    <SignatureCanvas 
                      ref={signatureRef}
                      penColor="black"
                      canvasProps={{ className: "w-full h-40 rounded-xl" }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => signatureRef.current?.clear()} className="text-xs text-slate-500 underline">Limpar Assinatura</button>
                    <span className="text-[10px] text-slate-600 italic">Data/Hora: {new Date().toLocaleString()}</span>
                  </div>
                </section>

                <Button 
                  className="w-full h-16 text-lg font-bold shadow-2xl shadow-emerald-900/20" 
                  onClick={() => { 
                    if (!clientSignatureInfo.name || !clientSignatureInfo.documentId) {
                      alert("Por favor, preencha as informações do cliente antes de finalizar.");
                      return;
                    }
                    alert("OS Concluída com Sucesso!"); 
                    setTechTab("list"); 
                    setClientSignatureInfo({ name: "", documentId: "", timestamp: "" });
                  }}
                >
                  FINALIZAR SERVIÇO
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Nav */}
        {techTab === "list" && (
          <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 p-4 flex justify-around items-center">
            <button className="flex flex-col items-center gap-1 text-emerald-500">
              <ClipboardList size={24} />
              <span className="text-[10px] font-bold uppercase">Tarefas</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500">
              <MapIcon size={24} />
              <span className="text-[10px] font-bold uppercase">Mapa</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500">
              <Settings size={24} />
              <span className="text-[10px] font-bold uppercase">Perfil</span>
            </button>
          </nav>
        )}
      </div>
    );
  }

  return null;
}
