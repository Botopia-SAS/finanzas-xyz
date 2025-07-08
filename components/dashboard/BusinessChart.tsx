"use client";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
}

interface ChartProps {
  movements: Movement[];
  period: "today" | "month" | "year" | "custom";
}

type ChartType = "bar" | "line" | "area" | "pie";

// Nombre de meses abreviados
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const COLORS = ["#38A169", "#3182CE", "#E53E3E", "#805AD5", "#ECC94B", "#319795"];

export default function BusinessChart({ movements, period }: ChartProps) {
  const [chartType, setChartType] = useState<ChartType | "pie">("bar");

  // Agrupación y filtrado según periodo
  const chartData = useMemo(() => {
    if (!Array.isArray(movements)) return [];

    let filteredMovements = movements;
    const today = new Date().toISOString().split('T')[0];

    if (period === "today") {
      filteredMovements = movements.filter(mov => mov.date === today);
    } else if (period === "year") {
      const year = new Date().getFullYear();
      filteredMovements = movements.filter(mov => new Date(mov.date).getFullYear() === year);
    } else if (period === "month") {
      const now = new Date();
      filteredMovements = movements.filter(mov =>
        new Date(mov.date).getMonth() === now.getMonth() &&
        new Date(mov.date).getFullYear() === now.getFullYear()
      );
    }

    // Agrupar por mes para año, por día para mes, por hora para hoy
    if (period === "year") {
      const grouped = Array.from({ length: 12 }, (_, i) => ({
        name: monthNames[i],
        ingresos: 0,
        gastos: 0,
        balance: 0,
      }));
      filteredMovements.forEach(mov => {
        const d = new Date(mov.date);
        const idx = d.getMonth();
        if (mov.type === "ingreso") grouped[idx].ingresos += mov.amount;
        else grouped[idx].gastos += Math.abs(mov.amount); // <-- valor absoluto
        grouped[idx].balance += mov.amount; // <-- suma directa
      });
      return grouped;
    } else if (period === "month") {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const grouped = Array.from({ length: daysInMonth }, (_, i) => ({
        name: `${i + 1}`,
        ingresos: 0,
        gastos: 0,
        balance: 0,
      }));
      filteredMovements.forEach(mov => {
        const d = new Date(mov.date);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const idx = d.getDate() - 1;
          if (mov.type === "ingreso") grouped[idx].ingresos += mov.amount;
          else grouped[idx].gastos += Math.abs(mov.amount); // <-- valor absoluto
          grouped[idx].balance += mov.amount; // <-- suma directa
        }
      });
      return grouped;
    } else if (period === "today") {
      const grouped = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        ingresos: 0,
        gastos: 0,
        balance: 0,
      }));
      filteredMovements.forEach(mov => {
        const d = new Date(mov.date);
        const idx = d.getHours();
        if (mov.type === "ingreso") grouped[idx].ingresos += mov.amount;
        else grouped[idx].gastos += Math.abs(mov.amount); // <-- valor absoluto
        grouped[idx].balance += mov.amount; // <-- suma directa
      });
      return grouped;
    } else {
      // Custom: agrupar por mes
      const groupedByMonth = filteredMovements.reduce<Record<string, { month: number; year: number; ingresos: number; gastos: number; balance: number }>>((acc, movement) => {
        const date = new Date(movement.date);
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        if (!acc[key]) {
          acc[key] = {
            month,
            year,
            ingresos: 0,
            gastos: 0,
            balance: 0,
          };
        }
        if (movement.type === "ingreso") acc[key].ingresos += movement.amount;
        else acc[key].gastos += Math.abs(movement.amount); // <-- valor absoluto
        acc[key].balance += movement.amount; // <-- suma directa
        return acc;
      }, {});
      return Object.values(groupedByMonth)
        .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
        .map(item => ({
          name: monthNames[item.month],
          ingresos: item.ingresos,
          gastos: item.gastos,
          balance: item.balance,
        }));
    }
  }, [movements, period]);

  // Datos para torta (pie)
  const pieData = useMemo(() => {
    const ingresos = movements.filter(m => m.type === "ingreso").reduce((a, b) => a + b.amount, 0);
    const gastos = movements.filter(m => m.type === "gasto").reduce((a, b) => a + Math.abs(b.amount), 0); // <-- valor absoluto
    return [
      { name: "Ingresos", value: ingresos },
      { name: "Gastos", value: gastos },
    ];
  }, [movements]);

  // Formato para los valores monetarios
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  // Si no hay datos suficientes, mostramos un mensaje
  if (chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className="mb-4">No hay suficientes datos para generar un gráfico</p>
        <p className="text-sm">Agrega movimientos para visualizar estadísticas</p>
      </div>
    );
  }

  // Selector de tipo de gráfico
  const renderChartTypeSelector = () => (
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      <button
        onClick={() => setChartType("bar")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          chartType === "bar"
            ? "bg-orange-100 text-orange-700 shadow"
            : "bg-gray-100 text-gray-600 hover:bg-orange-50"
        }`}
      >
        Barras
      </button>
      <button
        onClick={() => setChartType("line")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          chartType === "line"
            ? "bg-cyan-100 text-cyan-700 shadow"
            : "bg-gray-100 text-gray-600 hover:bg-cyan-50"
        }`}
      >
        Líneas
      </button>
      <button
        onClick={() => setChartType("area")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          chartType === "area"
            ? "bg-green-100 text-green-700 shadow"
            : "bg-gray-100 text-gray-600 hover:bg-green-50"
        }`}
      >
        Área
      </button>
      <button
        onClick={() => setChartType("pie")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          chartType === "pie"
            ? "bg-purple-100 text-purple-700 shadow"
            : "bg-gray-100 text-gray-600 hover:bg-purple-50"
        }`}
      >
        Torta
      </button>
    </div>
  );

  // Renderizar el tipo de gráfico seleccionado
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const axisProps = {
      xAxis: <XAxis dataKey="name" />,
      yAxis: <YAxis tickFormatter={formatCurrency} width={90} />,
      cartesian: <CartesianGrid strokeDasharray="3 3" vertical={false} />,
      tooltip: (
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), undefined]}
          labelFormatter={(label) => period === "month" ? `Día: ${label}` : period === "today" ? `Hora: ${label}` : `Mes: ${label}`}
        />
      ),
      legend: <Legend />,
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {axisProps.cartesian}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Line
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              stroke="#38A169"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              stroke="#3182CE"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#ECC94B"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            {axisProps.cartesian}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Area
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              fill="#38A16933"
              stroke="#38A169"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              fill="#3182CE33"
              stroke="#3182CE"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Balance"
              fill="#ECC94B33"
              stroke="#ECC94B"
              strokeWidth={2}
            />
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart width={400} height={320}>
            <Tooltip formatter={(value: number) => [formatCurrency(value), undefined]} />
            <Legend />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case "bar":
      default:
        return (
          <BarChart {...commonProps}>
            {axisProps.cartesian}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Bar
              dataKey="ingresos"
              name="Ingresos"
              fill="#38A169"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="gastos"
              name="Gastos"
              fill="#3182CE"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="balance"
              name="Balance"
              fill="#ECC94B"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="h-full flex flex-col w-full">
      {renderChartTypeSelector()}
      <div className="flex-1 min-h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}