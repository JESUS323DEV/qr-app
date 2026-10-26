import { supabase } from '../../lib/supabase'

/* El contador de consultas a Overpass y sus límites de seguridad (tablas usos_prospeccion y ajustes_prospeccion).
   Los límites los cambia Jesús desde la pantalla; sin la tabla de ajustes se usan los de siempre. */

const LIMITE_DIARIO = 30
const LIMITE_MENSUAL = 300

const inicioDeDia = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const inicioDeMes = () => {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// Las consultas de hoy y de este mes y los límites
export async function leerUsos() {
  const contar = desde => supabase.from('usos_prospeccion').select('id', { count: 'exact', head: true }).gte('creado', desde)
  const [ajustes, dia, mes] = await Promise.all([
    supabase.from('ajustes_prospeccion').select('limite_diario, limite_mensual').maybeSingle(),
    contar(inicioDeDia()),
    contar(inicioDeMes()),
  ])
  return {
    limiteDiario: ajustes.data?.limite_diario ?? LIMITE_DIARIO,
    limiteMensual: ajustes.data?.limite_mensual ?? LIMITE_MENSUAL,
    hoy: dia.count ?? 0,
    mes: mes.count ?? 0,
  }
}

// Apunta una consulta hecha (zona o barrio)
export async function anotarUso(tipo) {
  const { data } = await supabase.auth.getSession()
  await supabase.from('usos_prospeccion').insert({ tipo, usuario: data.session?.user.id ?? null })
}

export async function guardarLimites({ diario, mensual }) {
  const { error } = await supabase.from('ajustes_prospeccion').update({ limite_diario: diario, limite_mensual: mensual }).eq('id', true)
  if (error) throw error
}
