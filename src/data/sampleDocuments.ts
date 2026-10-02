import { TechnicalDocument } from '../types';

export const SAMPLE_DOCUMENTS: TechnicalDocument[] = [
  {
    id: 'doc-mec-104',
    code: 'DWG-ROT-104',
    title: 'Conjunto Redutor Planetário de Impressão - Linha Rotomec',
    description: 'Desenho de conjunto mecânico mostrando eixo motriz, engrenagens planetárias helicoidais, mancais de rolamentos cônicos e selos mecânicos de vedação para impressora Rotomec.',
    category: '07 - LAMINAÇÃO',
    subcategory: 'ROTOMEC',
    type: 'drawing',
    discipline: 'Mecânica / Transmissão de Potência',
    revision: 'Rev. 03',
    date: '14/08/2025',
    author: 'Eng. Roberto Albuquerque (CREA 14892)',
    approver: 'Eng. Carlos Mendonça (CREA 08912)',
    scale: '1:10 (A1)',
    status: 'Aprovado',
    format: 'SVG Vector HD',
    fileSize: '4.8 MB',
    resolution: 'Vetor Infinito (300+ DPI)',
    isOfflineCached: true,
    equipmentCode: 'RED-LAM-01',
    tags: ['Redutor', 'Engrenagem', 'Mancal', 'Eixo', 'Corte Transversal', 'ISO 286'],
    specs: {
      'Torque Nominal': '45.000 Nm',
      'Relação de Redução (i)': '1:24.5',
      'Potência do Acionamento': '350 kW @ 1.780 RPM',
      'Lubrificação': 'Óleo Sintético ISO VG 320 Circulação Forçada',
      'Folga de Flanco (Backlash)': '0.12 - 0.18 mm',
      'Tolerância do Munhão': 'Ø 140 mm k6 (+0.021 / +0.003)'
    },
    notes: [
      'Todas as dimensões em milímetros, exceto onde indicado em contrário.',
      'Chanfros não cotados: 2.0 x 45°. Raios de concordância nos eixos: R = 3.5 mm polido.',
      'Tratamento térmico nas engrenagens: Cementação e têmpera (Dureza superficial 58-62 HRC).',
      'Substituição de vedações somente com retentores FKM (Viton) lábio duplo com mola.'
    ],
    annotations: [
      {
        id: 'ann-1',
        x: 48,
        y: 42,
        title: 'Verificação Folga Axial',
        text: 'Ajustar calços do mancal com micrômetro para obter pré-carga de 0.05 mm no rolamento cônico SKF 32228.',
        author: 'Mecânico Chefe Silva',
        date: '18/08/2025',
        type: 'cota'
      },
      {
        id: 'ann-2',
        x: 72,
        y: 58,
        title: 'Ponto de Lubrificação Rápida',
        text: 'Niple de engraxamento rápido G 1/4" em inox montado na tampa frontal de inspeção.',
        author: 'Eng. Manutenção Laminação',
        date: '20/08/2025',
        type: 'nota'
      }
    ],
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <!-- Background border & Sheet frame -->
  <rect x="10" y="10" width="1180" height="780" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <rect x="20" y="20" width="1160" height="760" fill="none" stroke="#64748b" stroke-width="1"/>
  
  <!-- Outer Title Grid / Coordinate Marks -->
  <g stroke="#94a3b8" stroke-width="0.8" font-family="monospace" font-size="11" fill="#64748b">
    <line x1="20" y1="400" x2="35" y2="400"/>
    <line x1="1165" y1="400" x2="1180" y2="400"/>
    <line x1="600" y1="20" x2="600" y2="35"/>
    <line x1="600" y1="765" x2="600" y2="780"/>
    <text x="25" y="395">A</text>
    <text x="595" y="32">1</text>
    <text x="595" y="776">1</text>
  </g>

  <!-- Centerlines (Traço e ponto) -->
  <g stroke="#ef4444" stroke-width="1.2" stroke-dasharray="14,4,3,4" opacity="0.85">
    <line x1="80" y1="380" x2="1100" y2="380" />
    <line x1="420" y1="120" x2="420" y2="640" />
    <line x1="720" y1="120" x2="720" y2="640" />
    <line x1="570" y1="180" x2="570" y2="580" />
  </g>

  <!-- Housing Gearbox Main Body Section -->
  <g stroke="#0f172a" stroke-width="2.2" fill="#f8fafc">
    <!-- Top Casting Wall -->
    <path d="M 180 220 L 220 200 L 920 200 L 960 220 L 960 260 L 910 260 L 910 230 L 230 230 L 230 260 L 180 260 Z" fill="#e2e8f0" stroke="#1e293b"/>
    <!-- Bottom Casting Wall -->
    <path d="M 180 540 L 220 560 L 920 560 L 960 540 L 960 500 L 910 500 L 910 530 L 230 530 L 230 500 L 180 500 Z" fill="#e2e8f0" stroke="#1e293b"/>

    <!-- Left Flange / Cover -->
    <path d="M 140 270 L 190 270 L 190 320 L 160 320 L 160 440 L 190 440 L 190 490 L 140 490 Z" fill="#cbd5e1"/>
    <!-- Right Flange / Output Seal Carrier -->
    <path d="M 950 280 L 1000 280 L 1000 320 L 970 320 L 970 440 L 1000 440 L 1000 480 L 950 480 Z" fill="#cbd5e1"/>

    <!-- Main Central Shaft (Eixo Central) -->
    <rect x="100" y="345" width="980" height="70" rx="3" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/>
    <rect x="220" y="330" width="140" height="100" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="2"/>
    <rect x="460" y="315" width="220" height="130" rx="2" fill="#475569" stroke="#0f172a" stroke-width="2.2"/>
    <rect x="780" y="330" width="140" height="100" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="2"/>

    <!-- Keyway & Shaft Chamfers -->
    <rect x="115" y="360" width="70" height="12" fill="#334155" stroke="#0f172a"/>
    <rect x="985" y="360" width="80" height="14" fill="#334155" stroke="#0f172a"/>
  </g>

  <!-- Bearings (Rolamentos Cônicos SKF com Cruzetas) -->
  <g stroke="#0f172a" stroke-width="1.8">
    <!-- Left Top Bearing -->
    <rect x="250" y="240" width="80" height="85" fill="#f1f5f9"/>
    <line x1="250" y1="240" x2="330" y2="325" stroke="#2563eb" stroke-width="2"/>
    <line x1="250" y1="325" x2="330" y2="240" stroke="#2563eb" stroke-width="2"/>
    <circle cx="290" cy="282" r="16" fill="#60a5fa"/>

    <!-- Left Bottom Bearing -->
    <rect x="250" y="435" width="80" height="85" fill="#f1f5f9"/>
    <line x1="250" y1="435" x2="330" y2="520" stroke="#2563eb" stroke-width="2"/>
    <line x1="250" y1="520" x2="330" y2="435" stroke="#2563eb" stroke-width="2"/>
    <circle cx="290" cy="478" r="16" fill="#60a5fa"/>

    <!-- Right Top Bearing -->
    <rect x="810" y="240" width="80" height="85" fill="#f1f5f9"/>
    <line x1="810" y1="240" x2="890" y2="325" stroke="#2563eb" stroke-width="2"/>
    <line x1="810" y1="325" x2="890" y2="240" stroke="#2563eb" stroke-width="2"/>
    <circle cx="850" cy="282" r="16" fill="#60a5fa"/>

    <!-- Right Bottom Bearing -->
    <rect x="810" y="435" width="80" height="85" fill="#f1f5f9"/>
    <line x1="810" y1="435" x2="890" y2="520" stroke="#2563eb" stroke-width="2"/>
    <line x1="810" y1="520" x2="890" y2="435" stroke="#2563eb" stroke-width="2"/>
    <circle cx="850" cy="478" r="16" fill="#60a5fa"/>
  </g>

  <!-- Sun Gear & Helical Teeth (Dentes de Engrenagens Helicoidais com hachuras) -->
  <g stroke="#0f172a" stroke-width="1.8">
    <!-- Upper Helical Pinion Teeth -->
    <path d="M 460 210 L 680 210 L 680 315 L 460 315 Z" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
    <!-- Gear teeth hatch pattern -->
    <line x1="480" y1="210" x2="520" y2="315" stroke="#6366f1" stroke-width="2"/>
    <line x1="520" y1="210" x2="560" y2="315" stroke="#6366f1" stroke-width="2"/>
    <line x1="560" y1="210" x2="600" y2="315" stroke="#6366f1" stroke-width="2"/>
    <line x1="600" y1="210" x2="640" y2="315" stroke="#6366f1" stroke-width="2"/>
    <line x1="640" y1="210" x2="680" y2="315" stroke="#6366f1" stroke-width="2"/>

    <!-- Lower Helical Pinion Teeth -->
    <path d="M 460 445 L 680 445 L 680 550 L 460 550 Z" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
    <line x1="480" y1="445" x2="520" y2="550" stroke="#6366f1" stroke-width="2"/>
    <line x1="520" y1="445" x2="560" y2="550" stroke="#6366f1" stroke-width="2"/>
    <line x1="560" y1="445" x2="600" y2="550" stroke="#6366f1" stroke-width="2"/>
    <line x1="600" y1="445" x2="640" y2="550" stroke="#6366f1" stroke-width="2"/>
    <line x1="640" y1="445" x2="680" y2="550" stroke="#6366f1" stroke-width="2"/>
  </g>

  <!-- Technical Dimensions & Cotas (ABNT NBR 10126) -->
  <g stroke="#0284c7" stroke-width="1.2" fill="#0284c7" font-family="'JetBrains Mono', monospace" font-size="12">
    <!-- Shaft End Diameter Cota -->
    <line x1="75" y1="345" x2="75" y2="415"/>
    <line x1="65" y1="345" x2="105" y2="345" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="65" y1="415" x2="105" y2="415" stroke="#94a3b8" stroke-width="0.8"/>
    <polygon points="75,345 72,354 78,354"/>
    <polygon points="75,415 72,406 78,406"/>
    <text x="32" y="384" font-weight="600">Ø 90 k6</text>

    <!-- Total Length Cota (Top) -->
    <line x1="100" y1="160" x2="1080" y2="160"/>
    <line x1="100" y1="150" x2="100" y2="345" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="1080" y1="150" x2="1080" y2="345" stroke="#94a3b8" stroke-width="0.8"/>
    <polygon points="100,160 110,157 110,163"/>
    <polygon points="1080,160 1070,157 1070,163"/>
    <text x="540" y="152" font-weight="600" text-anchor="middle">1.240 ± 0.5 mm</text>

    <!-- Gear Width Cota -->
    <line x1="460" y1="600" x2="680" y2="600"/>
    <line x1="460" y1="550" x2="460" y2="610" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="680" y1="550" x2="680" y2="610" stroke="#94a3b8" stroke-width="0.8"/>
    <polygon points="460,600 470,597 470,603"/>
    <polygon points="680,600 670,597 670,603"/>
    <text x="570" y="620" font-weight="600" text-anchor="middle">220 mm (Z=32 Mn=8)</text>

    <!-- Bearing Span Cota -->
    <line x1="290" y1="670" x2="850" y2="670"/>
    <line x1="290" y1="520" x2="290" y2="680" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="850" y1="520" x2="850" y2="680" stroke="#94a3b8" stroke-width="0.8"/>
    <polygon points="290,670 300,667 300,673"/>
    <polygon points="850,670 840,667 840,673"/>
    <text x="570" y="690" font-weight="600" text-anchor="middle">DISTÂNCIA ENTRE CENTROS DE MANCAIS: 560 mm</text>
  </g>

  <!-- Surface Finish & Geometric Tolerances Symbols (Rugosidade Ra / Batimento) -->
  <g font-family="sans-serif" font-size="11" fill="#0f172a" stroke="#0f172a">
    <!-- Ra 0.8 symbol at shaft journal -->
    <path d="M 235 315 L 243 300 L 255 300" fill="none" stroke-width="1.2"/>
    <text x="245" y="296" stroke="none" font-size="10" font-weight="bold">Ra 0.8</text>

    <!-- Concentricity Symbol -->
    <rect x="735" y="300" width="70" height="20" fill="#ffffff" stroke-width="1.2"/>
    <line x1="755" y1="300" x2="755" y2="320" stroke-width="1"/>
    <circle cx="745" cy="310" r="5" fill="none" stroke-width="1.2"/>
    <circle cx="745" cy="310" r="2.5" fill="none" stroke-width="1.2"/>
    <text x="760" y="314" stroke="none" font-size="10">0.015 A</text>
  </g>

  <!-- Engineering Title Block (Carimbo Técnico ABNT NBR 10068 no Canto Inferior Direito) -->
  <g transform="translate(730, 650)">
    <rect x="0" y="0" width="440" height="120" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <line x1="0" y1="35" x2="440" y2="35" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="0" y1="75" x2="440" y2="75" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="260" y1="35" x2="260" y2="120" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="350" y1="35" x2="350" y2="120" stroke="#0f172a" stroke-width="1.5"/>

    <text x="12" y="24" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1e3a8a">LAMINADOR DE DESBASTE - ÁREA 01</text>
    <text x="12" y="52" font-family="sans-serif" font-size="9" fill="#64748b">TÍTULO DA PRANCHA:</text>
    <text x="12" y="68" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">REDUTOR PLANETÁRIO - CORTE TÉCNICO</text>

    <text x="12" y="92" font-family="sans-serif" font-size="9" fill="#64748b">CÓDIGO DE DESENHO:</text>
    <text x="12" y="108" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="12" fill="#0f172a">DWG-MEC-104</text>

    <text x="268" y="52" font-family="sans-serif" font-size="9" fill="#64748b">ESCALA:</text>
    <text x="268" y="68" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">1:10</text>

    <text x="268" y="92" font-family="sans-serif" font-size="9" fill="#64748b">FOLHA:</text>
    <text x="268" y="108" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">01 / 04</text>

    <text x="358" y="52" font-family="sans-serif" font-size="9" fill="#64748b">REVISÃO:</text>
    <text x="358" y="70" font-family="sans-serif" font-weight="bold" font-size="14" fill="#dc2626">REV. 03</text>

    <text x="358" y="92" font-family="sans-serif" font-size="9" fill="#64748b">DATA:</text>
    <text x="358" y="108" font-family="sans-serif" font-weight="bold" font-size="10" fill="#0f172a">14/08/2025</text>
  </g>
</svg>`
  },
  {
    id: 'doc-el-203',
    code: 'EL-SUB-203',
    title: 'Diagrama Unifilar Geral da Subestação Principal 13.8 kV / 440 V',
    description: 'Esquema elétrico unifilar com barramentos seccionados, disjuntores de vácuo, transformadores a seco 2.500 kVA, relés numéricos de proteção 50/51/87 e sistema de intertravamento Kirk.',
    category: '13 - UTILIDADES',
    subcategory: 'SUBESTAÇÃO',
    type: 'drawing',
    discipline: 'Engenharia Elétrica de Potência',
    revision: 'Rev. 02',
    date: '28/07/2025',
    author: 'Eng. Juliana Peixoto (CREA 20419)',
    approver: 'Eng. Carlos Mendonça (CREA 08912)',
    scale: 'Esquemático S/E',
    status: 'Aprovado',
    format: 'SVG Vector HD',
    fileSize: '3.9 MB',
    resolution: 'Vetor Infinito (300+ DPI)',
    isOfflineCached: true,
    equipmentCode: 'SE-PRI-01',
    tags: ['Subestação', 'Unifilar', '13.8kV', 'Transformador', 'Disjuntor', 'Relé 50/51'],
    specs: {
      'Tensão Primária': '13.800 V (60 Hz)',
      'Tensão Secundária': '440 V / 254 V (Estrela com Neutro Aterrado)',
      'Potência dos Transformadores': '2x 2.500 kVA (Dyn1)',
      'Corrente de Curto-Circuito': '25 kA simétrico (1s)',
      'Tipo de Disjuntor 13.8kV': 'Vácuo tripolar extraível 1.250 A',
      'Proteção Primária': 'Relé Microprocessado SEL-751A'
    },
    notes: [
      'Intertravamento eletromecânico do tipo chave Kirk impede paralelismo dos transformadores TR-01 e TR-02 sem autorização da coordenação.',
      'Aterramento de carcaça e neutro interligados à malha equipotencial de cobre nu 70 mm² (Resistência R < 1.0 Ohm).',
      'Painéis fabricados com arco interno resistente conforme IEC 62271-200 Classe AFLR 25kA 1s.'
    ],
    annotations: [
      {
        id: 'ann-el-1',
        x: 50,
        y: 45,
        title: 'Tie-Breaker Disjuntor de Acoplamento',
        text: 'DJ-TIE normalmente aberto. Intertravamento via CLP de transferência automática de carga.',
        author: 'Eletrotécnico Marcos',
        date: '02/08/2025',
        type: 'alerta'
      }
    ],
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <!-- Frame -->
  <rect x="10" y="10" width="1180" height="780" fill="none" stroke="#2563eb" stroke-width="2"/>
  <rect x="20" y="20" width="1160" height="760" fill="none" stroke="#64748b" stroke-width="0.8"/>

  <!-- Incoming Feeders 13.8 kV (Entrada Concessionária) -->
  <g stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <!-- Utility Infeed Line A -->
    <line x1="280" y1="60" x2="280" y2="150" stroke="#dc2626" stroke-width="3"/>
    <text x="280" y="50" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">ALIMENTADOR 13.8 kV (LINHA 01)</text>
    <!-- Surge Arrester -->
    <path d="M 240 100 L 280 100" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="220" y="90" width="20" height="20" fill="#f8fafc" stroke="#0f172a"/>
    <line x1="230" y1="110" x2="230" y2="125"/>
    <line x1="222" y1="125" x2="238" y2="125"/>
    <line x1="225" y1="128" x2="235" y2="128"/>

    <!-- Utility Infeed Line B -->
    <line x1="880" y1="60" x2="880" y2="150" stroke="#dc2626" stroke-width="3"/>
    <text x="880" y="50" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">ALIMENTADOR 13.8 kV (LINHA 02)</text>

    <!-- Disconnecting Switch (Seccionadora) -->
    <circle cx="280" cy="150" r="4" fill="#0f172a"/>
    <line x1="280" y1="150" x2="295" y2="185" stroke-width="2.5"/>
    <circle cx="280" cy="190" r="4" fill="#0f172a"/>

    <circle cx="880" cy="150" r="4" fill="#0f172a"/>
    <line x1="880" y1="150" x2="895" y2="185" stroke-width="2.5"/>
    <circle cx="880" cy="190" r="4" fill="#0f172a"/>

    <!-- Medium Voltage Vacuum Circuit Breakers (Disjuntores de Média Tensão 52-1 / 52-2) -->
    <rect x="260" y="205" width="40" height="40" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
    <text x="280" y="230" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">52-1</text>

    <rect x="860" y="205" width="40" height="40" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
    <text x="880" y="230" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">52-2</text>

    <line x1="280" y1="245" x2="280" y2="280" stroke-width="2.5"/>
    <line x1="880" y1="245" x2="880" y2="280" stroke-width="2.5"/>
  </g>

  <!-- 13.8 kV Main Busbars (Barramentos Bar-A e Bar-B com Tie Breaker) -->
  <g stroke="#b91c1c" stroke-width="5">
    <line x1="160" y1="280" x2="520" y2="280"/>
    <line x1="640" y1="280" x2="1000" y2="280"/>
  </g>
  <text x="170" y="270" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold" fill="#b91c1c">BARRAMENTO A - 13.8 kV (1.250 A)</text>
  <text x="650" y="270" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold" fill="#b91c1c">BARRAMENTO B - 13.8 kV (1.250 A)</text>

  <!-- 13.8 kV Tie Breaker (Acoplamento 52-TIE) -->
  <g stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <line x1="520" y1="280" x2="560" y2="280"/>
    <rect x="560" y="265" width="40" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
    <text x="580" y="285" font-size="10" font-weight="bold" fill="#d97706" text-anchor="middle">52-T</text>
    <line x1="600" y1="280" x2="640" y2="280"/>
    <text x="580" y="258" font-size="9" fill="#64748b" text-anchor="middle">N.A. INTERTRAVADO</text>
  </g>

  <!-- Transformer Feeders down to TR-01 and TR-02 -->
  <g stroke="#0f172a" stroke-width="2" fill="#ffffff">
    <!-- TR-01 Drop -->
    <line x1="340" y1="280" x2="340" y2="350"/>
    <!-- Protection CTs (Transformadores de Corrente 50/51) -->
    <circle cx="340" cy="320" r="9" fill="none" stroke="#2563eb" stroke-width="2"/>
    <circle cx="340" cy="330" r="9" fill="none" stroke="#2563eb" stroke-width="2"/>
    <text x="365" y="330" font-family="'JetBrains Mono', monospace" font-size="10" fill="#2563eb">TC 150-5A (Relé 50/51/87T)</text>

    <!-- Transformer Coils (Círculos Entrelaçados Dyn1) -->
    <circle cx="340" cy="380" r="26" fill="none" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="340" cy="420" r="26" fill="none" stroke="#0f172a" stroke-width="2.5"/>
    <text x="385" y="385" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">TR-01 (2.500 kVA)</text>
    <text x="385" y="405" font-family="sans-serif" font-size="10" fill="#64748b">13.8 kV / 440 V - Dyn1</text>
    <text x="385" y="420" font-family="sans-serif" font-size="10" fill="#64748b">Z = 6.25% - A Seco F</text>

    <!-- TR-02 Drop -->
    <line x1="820" y1="280" x2="820" y2="350"/>
    <circle cx="820" cy="320" r="9" fill="none" stroke="#2563eb" stroke-width="2"/>
    <circle cx="820" cy="330" r="9" fill="none" stroke="#2563eb" stroke-width="2"/>
    <text x="845" y="330" font-family="'JetBrains Mono', monospace" font-size="10" fill="#2563eb">TC 150-5A (Relé 50/51/87T)</text>

    <circle cx="820" cy="380" r="26" fill="none" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="820" cy="420" r="26" fill="none" stroke="#0f172a" stroke-width="2.5"/>
    <text x="865" y="385" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">TR-02 (2.500 kVA)</text>
    <text x="865" y="405" font-family="sans-serif" font-size="10" fill="#64748b">13.8 kV / 440 V - Dyn1</text>
    <text x="865" y="420" font-family="sans-serif" font-size="10" fill="#64748b">Z = 6.25% - A Seco F</text>
  </g>

  <!-- 440 V Low Voltage Busbars (CCM-Geral 440V) -->
  <g stroke="#2563eb" stroke-width="6">
    <line x1="160" y1="520" x2="520" y2="520"/>
    <line x1="640" y1="520" x2="1000" y2="520"/>
  </g>
  <text x="170" y="510" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold" fill="#1e40af">BARRAMENTO CCM-01 (440 V - 3.200 A)</text>
  <text x="650" y="510" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold" fill="#1e40af">BARRAMENTO CCM-02 (440 V - 3.200 A)</text>

  <!-- Main Air Circuit Breakers (Disjuntores Abertos 440V 52-BT1 e 52-BT2) -->
  <g stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <line x1="340" y1="446" x2="340" y2="470"/>
    <rect x="320" y="470" width="40" height="35" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
    <text x="340" y="492" font-size="10" font-weight="bold" fill="#1d4ed8" text-anchor="middle">52-B1</text>
    <line x1="340" y1="505" x2="340" y2="520"/>

    <line x1="820" y1="446" x2="820" y2="470"/>
    <rect x="800" y="470" width="40" height="35" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
    <text x="820" y="492" font-size="10" font-weight="bold" fill="#1d4ed8" text-anchor="middle">52-B2</text>
    <line x1="820" y1="505" x2="820" y2="520"/>

    <!-- Tie Breaker Low Voltage -->
    <line x1="520" y1="520" x2="560" y2="520"/>
    <rect x="560" y="505" width="40" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
    <text x="580" y="525" font-size="10" font-weight="bold" fill="#d97706" text-anchor="middle">TIE-BT</text>
    <line x1="600" y1="520" x2="640" y2="520"/>
  </g>

  <!-- Outgoing Loads (Saídas para os Motores do Laminador e Serviços Auxiliares) -->
  <g stroke="#0f172a" stroke-width="1.5" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="9">
    <!-- Load 1: Motor Principal Redutor -->
    <line x1="200" y1="520" x2="200" y2="570"/>
    <rect x="190" y="570" width="20" height="20" fill="#f1f5f9"/>
    <line x1="200" y1="590" x2="200" y2="615"/>
    <circle cx="200" cy="630" r="15" fill="#dbeafe" stroke="#1e40af" stroke-width="1.8"/>
    <text x="200" y="634" font-weight="bold" fill="#1e40af" text-anchor="middle">M1</text>
    <text x="200" y="658" fill="#475569" text-anchor="middle">350 kW</text>

    <!-- Load 2: Bombas de Lubrificação -->
    <line x1="280" y1="520" x2="280" y2="570"/>
    <rect x="270" y="570" width="20" height="20" fill="#f1f5f9"/>
    <line x1="280" y1="590" x2="280" y2="615"/>
    <circle cx="280" cy="630" r="15" fill="#dbeafe" stroke="#1e40af" stroke-width="1.8"/>
    <text x="280" y="634" font-weight="bold" fill="#1e40af" text-anchor="middle">M2</text>
    <text x="280" y="658" fill="#475569" text-anchor="middle">45 kW</text>

    <!-- Load 3: Banco de Capacitores 440V -->
    <line x1="440" y1="520" x2="440" y2="580"/>
    <line x1="430" y1="580" x2="450" y2="580" stroke-width="2"/>
    <line x1="430" y1="588" x2="450" y2="588" stroke-width="2"/>
    <text x="440" y="612" fill="#047857" font-weight="bold" text-anchor="middle">300 kvar</text>
    <text x="440" y="626" fill="#64748b" text-anchor="middle">FP Correção</text>

    <!-- Load 4: Centro de Controle de Motores Laminação -->
    <line x1="720" y1="520" x2="720" y2="570"/>
    <rect x="710" y="570" width="20" height="20" fill="#f1f5f9"/>
    <line x1="720" y1="590" x2="720" y2="620"/>
    <rect x="695" y="620" width="50" height="30" fill="#f8fafc" stroke="#334155"/>
    <text x="720" y="638" font-weight="bold" fill="#334155" text-anchor="middle">CCM-L02</text>
  </g>

  <!-- Title Block bottom-right -->
  <g transform="translate(730, 660)">
    <rect x="0" y="0" width="440" height="110" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <line x1="0" y1="30" x2="440" y2="30" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="0" y1="70" x2="440" y2="70" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="280" y1="30" x2="280" y2="110" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="360" y1="30" x2="360" y2="110" stroke="#0f172a" stroke-width="1.2"/>
    <text x="12" y="20" font-family="sans-serif" font-weight="bold" font-size="13" fill="#1e3a8a">SUBESTAÇÃO CENTRAL DE ENERGIA 13.8 kV</text>
    <text x="12" y="50" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">DIAGRAMA UNIFILAR DE POTÊNCIA E DISTRIBUIÇÃO</text>
    <text x="12" y="94" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="12" fill="#0f172a">EL-SUB-203</text>
    <text x="290" y="50" font-family="sans-serif" font-size="9" fill="#64748b">ESCALA: S/E</text>
    <text x="290" y="94" font-family="sans-serif" font-size="9" fill="#64748b">FOLHA: 01/02</text>
    <text x="370" y="50" font-family="sans-serif" font-size="9" fill="#64748b">REV:</text>
    <text x="370" y="70" font-family="sans-serif" font-weight="bold" font-size="14" fill="#dc2626">REV. 02</text>
    <text x="370" y="94" font-family="sans-serif" font-size="9" fill="#64748b">28/07/2025</text>
  </g>
</svg>`
  },
  {
    id: 'doc-foto-501',
    code: 'FTO-KMP1-501',
    title: 'Registro Fotográfico de END: Trinca por Fadiga em Munhão - Linha Kampf I',
    description: 'Fotografia técnica em alta definição de inspeção por Ensaio Não Destrutivo com Líquido Penetrante Fluorescente na Cortadeira / Rebobinadeira Kampf I.',
    category: '10 - CORTE',
    subcategory: 'KAMPF I',
    type: 'photo',
    discipline: 'Inspeção de Equipamentos & Ensaios Não Destrutivos (END)',
    revision: 'Relatório #841',
    date: '19/09/2025',
    author: 'Insp. Nível 2 ABENDI Fernando Costa',
    approver: 'Eng. Roberto Albuquerque (CREA 14892)',
    scale: 'Escala Fotográfica com Régua 1:1',
    status: 'Em Revisão',
    format: 'Hi-Res Raster',
    fileSize: '6.4 MB',
    resolution: '4096 x 2730 px (Ultra HD)',
    isOfflineCached: true,
    equipmentCode: 'EIXO-MOT-04',
    tags: ['Inspeção', 'Líquido Penetrante', 'Trinca', 'Fadiga', 'Munhão', 'ABENDI'],
    specs: {
      'Método de Inspeção': 'Líquido Penetrante Tipo II Método A (Visível Colorido)',
      'Comprimento da Descontinuidade': '42.5 mm contínua',
      'Profundidade Estimada por Ultrassom': '3.2 mm',
      'Temperatura da Peça no Teste': '24.8°C',
      'Tempo de Penetração (Dwell Time)': '25 minutos',
      'Critério de Aceitação': 'ASME Sec. VIII Div. 1 Apêndice 8 (REPROVADO)'
    },
    notes: [
      'Indicação linear relevante localizada a 180 mm do flange de acoplamento.',
      'Recomendada remoção por esmerilhamento controlado e conferência por partículas magnéticas para avaliar viabilidade de soldagem de recuperação com eletrodo especial.',
      'Operação do laminador suspensa na cadeira 01 até decisão da gerência de manutenção.'
    ],
    annotations: [
      {
        id: 'ann-fto-1',
        x: 52,
        y: 48,
        title: 'Início da Propagação da Trinca',
        text: 'Descontinuidade linear contínua com sangramento nítido do revelador branco.',
        author: 'Insp. N2 Costa',
        date: '19/09/2025',
        type: 'alerta'
      }
    ],
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <!-- Realistic Metallographic & Technical Inspection Photo Render -->
  <defs>
    <radialGradient id="flashLight" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="60%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </radialGradient>
    <linearGradient id="metalCylinder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="20%" stop-color="#94a3b8"/>
      <stop offset="45%" stop-color="#f1f5f9"/>
      <stop offset="70%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="penetrantGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>

  <!-- Photo Dark Background -->
  <rect width="1200" height="800" fill="url(#flashLight)"/>

  <!-- Steel Shaft Cylinder Being Inspected -->
  <rect x="80" y="160" width="1040" height="480" rx="12" fill="url(#metalCylinder)" stroke="#0f172a" stroke-width="2"/>

  <!-- Developer Powder Layer (Camada de Revelador Branco Fosco na Área do Teste) -->
  <ellipse cx="600" cy="400" rx="380" ry="180" fill="#f8fafc" opacity="0.94"/>
  <ellipse cx="600" cy="400" rx="360" ry="170" fill="#ffffff" opacity="0.85"/>

  <!-- The Fatigue Crack (Trinca Vermelha Sangrada no Líquido Penetrante) -->
  <path d="M 420 380 Q 480 370 540 395 T 660 390 T 780 410" fill="none" stroke="url(#penetrantGlow)" stroke-width="7" stroke-linecap="round"/>
  <!-- Secondary branching micro-cracks -->
  <path d="M 540 395 Q 560 415 580 425" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
  <path d="M 660 390 Q 690 375 720 370" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>

  <!-- Bleed Halos (Efeito de penetração do contraste) -->
  <path d="M 420 380 Q 480 370 540 395 T 660 390 T 780 410" fill="none" stroke="#f87171" stroke-width="14" opacity="0.3" stroke-linecap="round"/>

  <!-- Photogrammetric Reference Metric Scale (Régua de Calibração com divisões de 1 mm) -->
  <g transform="translate(380, 520)">
    <rect x="0" y="0" width="440" height="40" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
    <text x="220" y="18" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">ESCALA MÉTRICA DE CALIBRAÇÃO (1 DIV = 1 mm)</text>
    <!-- Scale ticks -->
    <line x1="20" y1="24" x2="420" y2="24" stroke="#0f172a" stroke-width="1.5"/>
    <!-- Major ticks every 20px (10mm) -->
    <line x1="20" y1="24" x2="20" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="60" y1="24" x2="60" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="100" y1="24" x2="100" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="140" y1="24" x2="140" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="180" y1="24" x2="180" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="220" y1="24" x2="220" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="260" y1="24" x2="260" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="300" y1="24" x2="300" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="340" y1="24" x2="340" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="380" y1="24" x2="380" y2="38" stroke="#0f172a" stroke-width="2"/>
    <line x1="420" y1="24" x2="420" y2="38" stroke="#0f172a" stroke-width="2"/>
    <text x="20" y="36" font-family="monospace" font-size="8" fill="#0f172a">0</text>
    <text x="220" y="36" font-family="monospace" font-size="8" fill="#0f172a">50mm</text>
    <text x="405" y="36" font-family="monospace" font-size="8" fill="#0f172a">100mm</text>
  </g>

  <!-- Inspection Target Callout Overlay -->
  <g stroke="#ef4444" stroke-width="2" fill="none">
    <circle cx="600" cy="395" r="70" stroke-dasharray="8,4"/>
    <line x1="600" y1="315" x2="600" y2="260"/>
    <line x1="600" y1="260" x2="720" y2="260"/>
  </g>
  <rect x="725" y="240" width="220" height="44" fill="#0f172a" rx="4"/>
  <text x="735" y="258" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" fill="#ef4444">DESCONTINUIDADE RELEVANTE</text>
  <text x="735" y="274" font-family="sans-serif" font-size="10" fill="#f8fafc">Comprimento: 42.5 mm (Trinca)</text>

  <!-- Title Block & Inspection Stamp (ABENDI) -->
  <g transform="translate(730, 650)">
    <rect x="0" y="0" width="440" height="120" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <line x1="0" y1="35" x2="440" y2="35" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="0" y1="75" x2="440" y2="75" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="280" y1="35" x2="280" y2="120" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="360" y1="35" x2="360" y2="120" stroke="#0f172a" stroke-width="1.2"/>
    <text x="12" y="24" font-family="sans-serif" font-weight="bold" font-size="13" fill="#991b1b">LAUDO DE INSPEÇÃO TÉCNICA - END</text>
    <text x="12" y="52" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">FOTO TÉCNICA: LÍQUIDO PENETRANTE</text>
    <text x="12" y="104" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="13" fill="#0f172a">FTO-INSP-501</text>
    <text x="290" y="52" font-family="sans-serif" font-size="9" fill="#64748b">ESCALA: 1:1</text>
    <text x="290" y="104" font-family="sans-serif" font-size="9" fill="#64748b">REL #841</text>
    <text x="370" y="52" font-family="sans-serif" font-size="9" fill="#64748b">STATUS:</text>
    <text x="370" y="72" font-family="sans-serif" font-weight="bold" font-size="12" fill="#dc2626">REPROVADO</text>
    <text x="370" y="104" font-family="sans-serif" font-size="9" fill="#64748b">19/09/2025</text>
  </g>
</svg>`
  },
  {
    id: 'doc-foto-502',
    code: 'FTO-VRX1-502',
    title: 'Termografia Infravermelha: Ponto Quente em Conexão CCM - Extrusora Varex I',
    description: 'Imagem radiométrica infravermelha com termômetro calibrado FLIR registrando sobreaquecimento térmico severo de 84.5°C na fase R do barramento alimentador da extrusora Varex I.',
    category: '08 - EXTRUSÃO',
    subcategory: 'VAREX I',
    type: 'photo',
    discipline: 'Termografia & Preditiva Elétrica',
    revision: 'Termo #312',
    date: '17/09/2025',
    author: 'Termografista N2 ITC André Moura',
    approver: 'Eng. Juliana Peixoto (CREA 20419)',
    scale: 'Radiométrica / Campo Aberto',
    status: 'Para Execução',
    format: 'Hi-Res Raster',
    fileSize: '4.5 MB',
    resolution: '1920 x 1440 px',
    isOfflineCached: true,
    equipmentCode: 'CCM-04-FAS-R',
    tags: ['Termografia', 'Infravermelho', 'Ponto Quente', 'Preditiva', 'Elétrica', 'FLIR'],
    specs: {
      'Temperatura Máxima no Ponto': '84.5°C (Fase R)',
      'Temperatura de Referência (Fase S)': '36.2°C',
      'Delta Térmico (ΔT)': '48.3°C (Severidade Crítica - NBR 15572)',
      'Câmera Termográfica': 'FLIR T1020 UltraMax (1024x768)',
      'Emissividade Calibrada (ε)': '0.88 (Cobre Oxidado)',
      'Temperatura Ambiente': '26.0°C com umidade 58%'
    },
    notes: [
      'ΔT > 40°C categoriza falha em severidade crítica (intervenção necessária em até 24 horas).',
      'Causa provável: Torque insuficiente ou oxidação no terminal prensado de fixação da sapata do cabo.',
      'Ação imediata: Reaperto dinamométrico com torquímetro calibrado para 45 Nm e aplicação de graxa condutiva neutra.'
    ],
    annotations: [
      {
        id: 'ann-term-1',
        x: 48,
        y: 44,
        title: 'Ponto Quente Crítico Sp1',
        text: 'Sp1 = 84.5°C vs Sp2 = 36.2°C na fase adjacente.',
        author: 'André Moura (ITC)',
        date: '17/09/2025',
        type: 'alerta'
      }
    ],
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <!-- Thermal Ironbow Gradient Simulation -->
  <defs>
    <linearGradient id="ironbow" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#03001e"/>
      <stop offset="25%" stop-color="#7303c0"/>
      <stop offset="50%" stop-color="#ec38bc"/>
      <stop offset="75%" stop-color="#fde24f"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <radialGradient id="hotSpot" cx="48%" cy="44%" r="35%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="15%" stop-color="#fde24f"/>
      <stop offset="35%" stop-color="#ec38bc"/>
      <stop offset="60%" stop-color="#7303c0"/>
      <stop offset="100%" stop-color="#180b38"/>
    </radialGradient>
  </defs>

  <!-- Thermal Frame Background -->
  <rect width="1200" height="800" fill="#03001e"/>

  <!-- CCM Cabinet Structure in Thermal Blue/Violet -->
  <rect x="140" y="100" width="860" height="580" fill="#180b38" stroke="#3b156b" stroke-width="3"/>

  <!-- Busbars R, S, T in thermal colors -->
  <!-- Phase R with Hot Spot -->
  <rect x="360" y="160" width="90" height="460" fill="#7303c0" opacity="0.8"/>
  <circle cx="405" cy="320" r="140" fill="url(#hotSpot)"/>

  <!-- Phase S (Normal 36°C) -->
  <rect x="520" y="160" width="90" height="460" fill="#3b156b"/>
  <rect x="520" y="280" width="90" height="100" fill="#7303c0" opacity="0.6"/>

  <!-- Phase T (Normal 35°C) -->
  <rect x="680" y="160" width="90" height="460" fill="#3b156b"/>
  <rect x="680" y="280" width="90" height="100" fill="#7303c0" opacity="0.5"/>

  <!-- Thermal Ironbow Color Scale on Right Margin -->
  <g transform="translate(1040, 160)">
    <rect x="0" y="0" width="30" height="440" fill="url(#ironbow)" stroke="#ffffff" stroke-width="1.5"/>
    <text x="40" y="15" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="bold" fill="#ffffff">90°C</text>
    <text x="40" y="120" font-family="'JetBrains Mono', monospace" font-size="11" fill="#fde24f">70°C</text>
    <text x="40" y="230" font-family="'JetBrains Mono', monospace" font-size="11" fill="#ec38bc">50°C</text>
    <text x="40" y="340" font-family="'JetBrains Mono', monospace" font-size="11" fill="#7303c0">35°C</text>
    <text x="40" y="440" font-family="'JetBrains Mono', monospace" font-size="11" fill="#93c5fd">20°C</text>
  </g>

  <!-- Crosshair Sp1 at Hotspot -->
  <g stroke="#ffffff" stroke-width="2">
    <line x1="390" y1="320" x2="420" y2="320"/>
    <line x1="405" y1="305" x2="405" y2="335"/>
    <circle cx="405" cy="320" r="14" fill="none"/>
  </g>
  <rect x="425" y="295" width="130" height="32" fill="#000000" stroke="#fde24f" stroke-width="1.5" rx="3"/>
  <text x="435" y="316" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold" fill="#fde24f">Sp1: 84.5°C</text>

  <!-- Crosshair Sp2 at Phase S Normal -->
  <g stroke="#ffffff" stroke-width="1.5">
    <line x1="550" y1="320" x2="580" y2="320"/>
    <line x1="565" y1="305" x2="565" y2="335"/>
    <circle cx="565" cy="320" r="10" fill="none"/>
  </g>
  <rect x="580" y="302" width="110" height="26" fill="#000000" stroke="#ffffff" stroke-width="1" rx="3"/>
  <text x="588" y="320" font-family="'JetBrains Mono', monospace" font-size="11" fill="#ffffff">Sp2: 36.2°C</text>

  <!-- Thermographic Banner Information -->
  <g transform="translate(140, 590)">
    <rect x="0" y="0" width="860" height="70" fill="#000000" opacity="0.8" stroke="#7303c0" stroke-width="1"/>
    <text x="20" y="25" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold" fill="#fde24f">ANÁLISE TERMOGRÁFICA: ΔT = 48.3°C [SEVERIDADE: CRÍTICA]</text>
    <text x="20" y="48" font-family="'JetBrains Mono', monospace" font-size="11" fill="#ffffff">Equipamento: Painel CCM-04 | Emissividade: 0.88 | Temp. Ref: 36.2°C | Limite NBR: 70°C</text>
  </g>

  <!-- Title block -->
  <g transform="translate(730, 670)">
    <rect x="0" y="0" width="440" height="100" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <line x1="0" y1="30" x2="440" y2="30" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="0" y1="65" x2="440" y2="65" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="280" y1="30" x2="280" y2="100" stroke="#0f172a" stroke-width="1.2"/>
    <text x="12" y="20" font-family="sans-serif" font-weight="bold" font-size="12" fill="#991b1b">RELATÓRIO TERMOGRÁFICO PREDITIVO</text>
    <text x="12" y="48" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">TERMOGRAFIA BARRAMENTO CCM-04</text>
    <text x="12" y="85" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="12" fill="#0f172a">FTO-TERM-502</text>
    <text x="290" y="48" font-family="sans-serif" font-size="9" fill="#64748b">REV: #312</text>
    <text x="290" y="85" font-family="sans-serif" font-size="9" fill="#64748b">17/09/2025</text>
  </g>
</svg>`
  },
  {
    id: 'doc-aut-601',
    code: 'AUT-VRX2-601',
    title: 'Topologia em Anel Profinet e Distribuição de I/O do CLP - Varex II',
    description: 'Arquitetura de rede de automação industrial com anel de redundância MRP Profinet, CPU Siemens 1518-4 PN/DP, estações remotas ET 200SP, switches de campo Scalance para a linha Varex II.',
    category: '08 - EXTRUSÃO',
    subcategory: 'VAREX II',
    type: 'drawing',
    discipline: 'Automação Industrial & Redes',
    revision: 'Rev. 02',
    date: '22/08/2025',
    author: 'Eng. Gabriel Farias (CREA 42109)',
    approver: 'Eng. Carlos Mendonça (CREA 08912)',
    scale: 'Topológico S/E',
    status: 'Aprovado',
    format: 'SVG Vector HD',
    fileSize: '3.6 MB',
    resolution: 'Vetor Infinito (300+ DPI)',
    isOfflineCached: true,
    equipmentCode: 'RACK-CLP-VRX2',
    tags: ['CLP', 'Siemens', 'Profinet', 'Varex II', 'MRP', 'ET 200SP'],
    specs: {
      'Controlador Principal': 'Siemens S7-1518-4 PN/DP',
      'Protocolo de Rede': 'Profinet IO com MRP (Media Redundancy Protocol)',
      'Tempo de Reconfiguração': '< 200 ms em caso de rompimento da fibra',
      'Cabo de Rede': 'Fibra Óptica Monomodo 9/125 µm com conectores LC',
      'Switches de Rede': 'Scalance XC-208G (Gigabit Industrial)',
      'Total de Pontos I/O': '1.024 DI / 512 DO / 256 AI / 128 AO'
    },
    notes: [
      'O switch SCALANCE-01 atua como Redundancy Manager (MRM); os demais atuam como Redundancy Clients (MRC).',
      'Todas as estações remotas conectadas em anel fechado nos anéis ópticos Port 1 e Port 2.',
      'Alimentação redundante 24 Vcc fornecida por duas fontes SITOP PSU8200 de 40A com módulo de redundância SITOP PSE202U.'
    ],
    annotations: [
      {
        id: 'ann-aut-1',
        x: 48,
        y: 35,
        title: 'Gerenciador do Anel MRP',
        text: 'Switch SCALANCE-01 configurado como MRM. Não alterar prioridade de porta.',
        author: 'Gabriel Farias',
        date: '24/08/2025',
        type: 'nota'
      }
    ],
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <rect x="10" y="10" width="1180" height="780" fill="none" stroke="#2563eb" stroke-width="2"/>
  <rect x="20" y="20" width="1160" height="760" fill="none" stroke="#64748b" stroke-width="0.8"/>

  <!-- Profinet Optical Ring (Verde Profinet 009a49) -->
  <g stroke="#009a49" stroke-width="4" fill="none">
    <ellipse cx="600" cy="380" rx="420" ry="180" stroke-dasharray="12,6"/>
  </g>
  <text x="600" y="385" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="bold" fill="#009a49" text-anchor="middle">ANEL ÓPTICO PROFINET MRP (TEMPO DE RECUPERAÇÃO &lt; 200 ms)</text>

  <!-- Node 1: Master PLC Siemens S7-1518 (Top Center) -->
  <g transform="translate(480, 120)" stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <rect x="0" y="0" width="240" height="100" rx="6" fill="#f1f5f9" stroke="#009a49" stroke-width="3"/>
    <rect x="10" y="10" width="80" height="80" fill="#0f172a" rx="4"/>
    <text x="50" y="45" font-size="9" fill="#009a49" text-anchor="middle" font-weight="bold">SIEMENS</text>
    <text x="50" y="60" font-size="8" fill="#ffffff" text-anchor="middle">S7-1518</text>
    <text x="105" y="32" font-size="12" font-weight="bold" fill="#0f172a">CPU 1518-4 PN/DP</text>
    <text x="105" y="52" font-size="9" fill="#64748b">IP: 192.168.10.1</text>
    <text x="105" y="72" font-size="9" fill="#009a49" font-weight="bold">PROFINET MASTER</text>
  </g>

  <!-- Node 2: Remote ET200SP #1 (Right) -->
  <g transform="translate(860, 320)" stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <rect x="0" y="0" width="180" height="110" rx="6" fill="#f8fafc"/>
    <text x="90" y="28" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">REMOTE ET-200SP #01</text>
    <text x="90" y="48" font-size="9" fill="#64748b" text-anchor="middle">Oficina de Cilindros</text>
    <text x="90" y="68" font-size="9" fill="#009a49" text-anchor="middle">IP: 192.168.10.11</text>
    <rect x="20" y="80" width="140" height="18" fill="#e2e8f0" rx="3"/>
    <text x="90" y="93" font-size="8" fill="#334155" text-anchor="middle">32 DI / 32 DO / 16 AI</text>
  </g>

  <!-- Node 3: Inversor de Frequência Sinamics S120 (Bottom Right) -->
  <g transform="translate(680, 510)" stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <rect x="0" y="0" width="180" height="100" rx="6" fill="#f8fafc"/>
    <text x="90" y="28" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">SINAMICS S120</text>
    <text x="90" y="48" font-size="9" fill="#64748b" text-anchor="middle">Drive Motor Principal</text>
    <text x="90" y="68" font-size="9" fill="#009a49" text-anchor="middle">IP: 192.168.10.21</text>
  </g>

  <!-- Node 4: Remote ET200SP #2 (Bottom Left) -->
  <g transform="translate(340, 510)" stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <rect x="0" y="0" width="180" height="100" rx="6" fill="#f8fafc"/>
    <text x="90" y="28" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">REMOTE ET-200SP #02</text>
    <text x="90" y="48" font-size="9" fill="#64748b" text-anchor="middle">Lubrificação &amp; Válvulas</text>
    <text x="90" y="68" font-size="9" fill="#009a49" text-anchor="middle">IP: 192.168.10.12</text>
  </g>

  <!-- Node 5: Switch Scalance XC-208G (Left) -->
  <g transform="translate(160, 320)" stroke="#0f172a" stroke-width="2" fill="#ffffff" font-family="'JetBrains Mono', monospace">
    <rect x="0" y="0" width="180" height="110" rx="6" fill="#f8fafc" stroke="#2563eb"/>
    <text x="90" y="28" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">SCALANCE XC-208G</text>
    <text x="90" y="48" font-size="9" fill="#64748b" text-anchor="middle">Gerenciador de Anel</text>
    <text x="90" y="68" font-size="9" fill="#009a49" text-anchor="middle">IP: 192.168.10.254</text>
    <rect x="20" y="80" width="140" height="18" fill="#dbeafe" rx="3"/>
    <text x="90" y="93" font-size="8" fill="#1e40af" text-anchor="middle">MRP MANAGER</text>
  </g>

  <!-- Title Block -->
  <g transform="translate(730, 650)">
    <rect x="0" y="0" width="440" height="120" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <line x1="0" y1="35" x2="440" y2="35" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="0" y1="75" x2="440" y2="75" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="280" y1="35" x2="280" y2="120" stroke="#0f172a" stroke-width="1.2"/>
    <text x="12" y="24" font-family="sans-serif" font-weight="bold" font-size="13" fill="#1e3a8a">ARQUITETURA DE REDES E AUTOMAÇÃO</text>
    <text x="12" y="52" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">TOPOLOGIA ANEL MRP PROFINET</text>
    <text x="12" y="104" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="13" fill="#0f172a">AUT-VRX2-601</text>
    <text x="290" y="52" font-family="sans-serif" font-size="9" fill="#64748b">ESCALA: S/E</text>
    <text x="290" y="104" font-family="sans-serif" font-size="9" fill="#64748b">REV. 02</text>
  </g>
</svg>`
    },
    {
      id: 'doc-corte-503',
      code: 'DWG-KMP2-503',
      title: 'Sistema de Facas Rotativas e Controle de Tensão - Linha Kampf II',
      description: 'Desenho de conjunto do módulo de corte longitudinal, porta-facas pneumático e rolo oscilante de controle de tensão da rebobinadeira Kampf II.',
      category: '10 - CORTE',
      subcategory: 'KAMPF II',
      type: 'drawing',
      discipline: 'Mecânica / Corte e Rebobinamento',
      revision: 'Rev. 01',
      date: '05/09/2025',
      author: 'Eng. Roberto Albuquerque (CREA 14892)',
      approver: 'Eng. Carlos Mendonça (CREA 08912)',
      scale: '1:5 (A1)',
      status: 'Aprovado',
      format: 'SVG Vector HD',
      fileSize: '4.1 MB',
      resolution: 'Vetor Infinito (300+ DPI)',
      isOfflineCached: true,
      equipmentCode: 'CRT-KMP-02',
      tags: ['Corte', 'Kampf II', 'Faca Rotativa', 'Controle de Tensão', 'Rebobinadeira'],
      specs: {
        'Largura Útil': '2.200 mm',
        'Velocidade Máxima': '800 m/min',
        'Pressão Pneumática Facas': '6.0 bar',
        'Tipo de Lâmina': 'Bisel Duplo Ø 150 mm Aço Rápido HSS'
      },
      notes: [
        'Inspeção dimensional a cada 500 horas de operação.',
        'Lubrificação dos guias lineares com graxa sintética grau NLGI 2.'
      ],
      annotations: [],
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <rect width="1200" height="800" fill="#0f172a"/>
  <rect x="20" y="20" width="1160" height="760" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <g transform="translate(600, 350)" text-anchor="middle">
    <circle cx="0" cy="0" r="120" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
    <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#0ea5e9" stroke-width="2"/>
    <line x1="-150" y1="0" x2="150" y2="0" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8,4"/>
    <line x1="0" y1="-150" x2="0" y2="150" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8,4"/>
    <text y="180" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="bold" fill="#f8fafc">MÓDULO DE CORTE - KAMPF II</text>
    <text y="210" font-family="sans-serif" font-size="13" fill="#94a3b8">PASTA: 10 - CORTE / KAMPF II</text>
  </g>
  <g transform="translate(730, 650)">
    <rect x="0" y="0" width="440" height="120" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <line x1="0" y1="35" x2="440" y2="35" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="0" y1="75" x2="440" y2="75" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="280" y1="35" x2="280" y2="120" stroke="#0f172a" stroke-width="1.2"/>
    <text x="12" y="24" font-family="sans-serif" font-weight="bold" font-size="13" fill="#1e3a8a">10 - CORTE / KAMPF II</text>
    <text x="12" y="52" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0f172a">SISTEMA DE FACAS ROTATIVAS</text>
    <text x="12" y="104" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="13" fill="#0f172a">DWG-KMP2-503</text>
    <text x="290" y="52" font-family="sans-serif" font-size="9" fill="#64748b">ESCALA: 1:5</text>
    <text x="290" y="104" font-family="sans-serif" font-size="9" fill="#64748b">REV. 01</text>
  </g>
</svg>`
    }
];
