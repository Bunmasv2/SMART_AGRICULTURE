type CustomLabelProps = {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    name?: string;
    value?: number;
}

export default function CustomLabel({ cx, cy, midAngle, outerRadius, name, value }: CustomLabelProps) {
    if (cx === undefined || cy === undefined || midAngle === undefined || outerRadius === undefined) {
        return null;
    }

    const RADIAN = Math.PI / 180;

    // Tọa độ điểm bắt đầu trên vòng tròn
    const x0 = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const y0 = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    // Tọa độ điểm gãy (đường chéo)
    const x1 = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
    const y1 = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);

    // Tọa độ điểm kết thúc (đường ngang)
    const isRight = x1 > cx;
    const x2 = x1 + (isRight ? 30 : -30);
    const y2 = y1;

    return (
        <g>
            <path
                d={`M${x0},${y0}L${x1},${y1}L${x2},${y2}`}
                stroke="#cbd5e1"
                fill="none"
                strokeWidth={1}
            />
            <text
                x={x1 + (isRight ? 5 : -5)}
                y={y1 - 8}
                fill="#64748b"
                textAnchor={isRight ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="10"
                fontWeight="bold"
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
                {name}
            </text>
            <text
                x={x1 + (isRight ? 5 : -5)}
                y={y1 + 10}
                fill="#94a3b8"
                textAnchor={isRight ? 'start' : 'end'}
                fontSize="9"
                fontWeight="500"
            >
                {value} lô
            </text>
        </g>
    );
}
