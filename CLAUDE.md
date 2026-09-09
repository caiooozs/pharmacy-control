@AGENTS.md

Regra de negócio
Autenticação

Supabase Auth simples, sem hierarquia de permissões. Qualquer usuário autenticado tem acesso total de leitura e escrita no dashboard (não existe distinção de papéis como farmacêutico vs. atendente).

Produtos

Controle de estoque agregado por produto — não há controle por lote/validade. Cada produto tem uma única coluna quantidade_atual.

Regra crítica: quantidade_atual nunca é editada diretamente pela aplicação. Ela é sempre derivada de registros na tabela movimentacoes, aplicados automaticamente por uma trigger no banco. Nenhum formulário de "editar produto" deve expor esse campo como editável.

Movimentações

Toda alteração de estoque é registrada como uma movimentação de um dos 4 tipos:

Tipo Efeito na quantidade_atual Motivo obrigatório? Como o campo quantidade é interpretado
entrada soma Não (opcional) quantidade a adicionar
saida subtrai Sim quantidade a remover
ajuste substitui Sim valor absoluto da contagem física correta (não é delta)
perda subtrai Sim quantidade a remover (vencimento, quebra etc.)

Pontos importantes para quem for construir os formulários/hooks:

ajuste não é um delta. O usuário conta fisicamente o estoque (ex: inventário) e digita o valor real encontrado (ex: "47"); o backend substitui quantidade_atual por esse valor. A UI deve deixar isso claro (ex: label "Quantidade contada", não "Quantidade a ajustar").
saida e perda são bloqueadas se não houver estoque suficiente — o insert falha com uma exceção do Postgres se quantidade > quantidade_atual no momento da escrita. O client deve tratar esse erro (ex: toast) e não deve fazer a validação apenas no front.
Movimentações são um log de auditoria imutável: não podem ser editadas nem apagadas, nem pela aplicação nem via API REST do Supabase (reforçado por RLS — ver seção abaixo). Qualquer correção de um lançamento errado deve ser feita através de uma nova movimentação (tipicamente ajuste), nunca alterando o registro original.
user_id e created_at nunca devem ser enviados manualmente pelo client. user_id é preenchido automaticamente pelo banco via auth.uid(), extraído do JWT da sessão — não inclua esse campo no payload de insert.
Estoque mínimo e alertas

Cada produto tem estoque_minimo. Produtos com quantidade_atual <= estoque_minimo devem aparecer na visão de alerta do dashboard (via vw_produtos_estoque_baixo, ver schema).

Gráficos do dashboard

Três visões priorizadas:

Ranking de produtos mais movimentados — filtrável por tipo de movimentação e período (fn_ranking_produtos)
Entradas x Saídas por período — agrupável por dia/semana/mês (fn_movimentacoes_por_periodo)
Produtos abaixo do estoque mínimo — lista/tabela com destaque visual (vw_produtos_estoque_baixo)
Schema do banco (Supabase/Postgres)

O schema completo está em schema.sql. Resumo das decisões de design que o código da aplicação deve respeitar:

Tabelas
produtos: dados cadastrais + quantidade_atual (somente leitura para a aplicação — escrita só via trigger) + ativo (soft delete; produtos nunca são apagados de fato, pois têm FK em movimentacoes).
movimentacoes: log de auditoria. produto_id com on delete restrict (não é possível apagar um produto que já tem movimentações — reforça o uso de soft delete).
Trigger fn_aplicar_movimentacao

Executa após cada insert em movimentacoes e:

Trava a linha do produto (for update) para evitar condição de corrida em movimentações concorrentes do mesmo produto.
Aplica o efeito na quantidade_atual conforme a tabela de tipos acima.
Lança exceção (que cancela o insert inteiro, incluindo o próprio registro de movimentação) se saida/perda resultaria em estoque negativo.

Roda com security definer, então a aplicação não precisa ter permissão de UPDATE direta em produtos para que o efeito da movimentação seja aplicado (embora ela até tenha, via RLS).

RLS (Row Level Security)
produtos: CRUD completo liberado para qualquer usuário authenticated (sem filtro adicional, já que não há hierarquia).
movimentacoes: apenas SELECT e INSERT liberados para authenticated. Não existem policies de UPDATE/DELETE — com RLS habilitado, a ausência de policy nega a operação por padrão. Isso é o que torna a auditoria imutável na prática, não apenas por convenção de código.
O insert em movimentacoes exige auth.uid() = user_id, impedindo que um usuário insira uma movimentação em nome de outro.
Funções RPC para os gráficos

Como views do Postgres não aceitam parâmetros, os gráficos que precisam de filtro de data/tipo são implementados como funções (fn_movimentacoes_por_periodo, fn_ranking_produtos), chamadas via supabase.rpc(...). Ao criar os hooks do viewmodel, usar essas funções como fonte de dado, com a query key do TanStack Query incluindo os parâmetros de filtro (ex: ['ranking-produtos', dataInicio, dataFim, tipoFiltro]) para cache correto por combinação de filtros.

Convenções para o código gerado
Nunca gerar código que faça update direto em produtos.quantidade_atual — toda alteração de estoque deve passar por um insert em movimentacoes.
Nunca gerar formulário/mutation que permita editar ou apagar uma movimentação existente.
Ao criar uma movimentação do tipo ajuste, deixar explícito na UI/nomeação de variáveis que o valor é a contagem final, não um delta.
Tratar erros de insert em movimentacoes (ex: estoque insuficiente) e exibir feedback ao usuário — não confiar apenas em validação client-side.
Seguir a separação MVVM: componentes de UI não devem chamar o Supabase diretamente; a chamada passa por services/, orquestrada por hooks em viewmodels/.
