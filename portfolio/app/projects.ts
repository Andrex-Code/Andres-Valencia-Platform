export const projects = [
  {
    number: '02',
    category: 'AUTOMATIZACIÓN / ESCRITORIO',
    title: 'Automatizador BI',
    description:
      'Del archivo de entrada al reporte final. Una aplicación para transformar insumos y ejecutar procesos de facturación y cartera.',
    detail:
      'La versión local incorpora un modo automático de descarga, procesamiento y carga de resultados en Microsoft 365, con seguimiento por etapas.',
    tags: ['Python', 'Tkinter', 'Excel', 'Microsoft 365'],
    repo: 'automatizacion-bi',
    publicLink: false,
    note: 'Automatización de principio a fin',
    accent: 'blue',
    flow: ['Insumos', 'Reglas', 'Reportes'],
  },
  {
    number: '03',
    category: 'WEB APP / SEGUIMIENTO OPERATIVO',
    title: 'Seguimiento de agentes',
    description:
      'Un lugar para registrar errores y mejoras de agentes conversacionales, con evidencias, prioridades, estados e historial.',
    detail:
      'Transforma el seguimiento manual en reportes que los asesores crean y los responsables revisan y cierran, con permisos por rol.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma'],
    repo: 'seguimiento-agentes',
    publicLink: false,
    note: 'Roles, evidencias e historial',
    accent: 'orange',
    flow: ['Reporte', 'Revisión', 'Cierre'],
  },
  {
    number: '04',
    category: 'AUTOMATIZACIÓN / VISIÓN ARTIFICIAL',
    title: 'Validador de identidad',
    description:
      'Una herramienta de escritorio para consultar evidencias, comparar rostros localmente y organizar casos que necesitan revisión.',
    detail:
      'Integra el trabajo con Excel y conserva la confirmación de posibles casos de suplantación en manos del asesor.',
    tags: ['Python', 'ONNX', 'Excel', 'Windows'],
    repo: 'revision-identidad',
    publicLink: false,
    note: 'Apoyo a la revisión humana',
    accent: 'purple',
    flow: ['Evidencia', 'Comparación', 'Revisión'],
  },
  {
    number: '05',
    category: 'PRODUCTO WEB / COMERCIO LOCAL',
    title: 'RapiBatará',
    description:
      'El flujo de una tienda de conjunto cerrado en una aplicación: catálogo, carrito, pagos, inventario y despacho.',
    detail:
      'Un prototipo pensado para compradores y tenderos, con interfaz adaptable a móviles y funcionamiento con datos locales.',
    tags: ['React', 'TypeScript', 'Vite', 'CSS'],
    repo: 'RapiBatara',
    publicLink: true,
    note: 'Prototipo con datos locales',
    accent: 'green',
    flow: ['Pedido', 'Aprobación', 'Despacho'],
  },
];
