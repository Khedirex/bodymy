// Caminho de um arquivo de public/ respeitando o `base` do build
// ("/" num domínio próprio, "/ritual/" dentro do app BodyMy).
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '')
