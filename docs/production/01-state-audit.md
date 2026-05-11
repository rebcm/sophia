# Auditoria de Estado · Sprint 1

## src/ atual

| Arquivo | Linhas | Função | Manter? |
|---------|--------|--------|---------|
| `main.tsx` | ~10 | Bootstrap React | ✅ |
| `App.tsx` | ~218 | Orquestrador narrativo | 🔄 Refatorar para novo flow |
| `styles.css` | ? | CSS global | ✅ |
| `state/gameStore.ts` | ~120 | Estado único | 🔄 Split em 4 stores |
| `audio/SophiaAudio.ts` | ? | Web Audio procedural | ✅ |
| `dialog/script.ts` | ? | Falas hardcoded | ✅ (expandir depois) |
| `scenes/GardenScene.tsx` | ? | Cena 3D do Jardim | ✅ |
| `systems/AwakeningController.ts` | ? | Mini-game ritmo | ✅ |
| `ui/AwakeningRing.tsx` | ? | Anel visual do mini-game | ✅ |
| `ui/Cursor.tsx` | ? | Cursor custom | ✅ |
| `ui/DialogBox.tsx` | ? | Caixa de diálogo | ✅ |
| `ui/HUD.tsx` | ? | HUD (Luz, lugar) | 🔄 Adicionar Centelha visualization |
| `ui/IntroOverlay.tsx` | ? | Tela de "clique para começar" | 🔄 Substituir por TitleScreen |
| `world/Garden.tsx` | ? | Grama, árvores, fireflies | ✅ |
| `world/Player.tsx` | ? | Orbe player | 🔄 Adicionar Centelha como filha |
| `world/PleromaSky.tsx` | ? | Skybox violeta | ✅ |
| `world/Sleeper.tsx` | ? | NPC adormecido | ✅ |
| `world/Whisperer.tsx` | ? | Orbe companheira | ✅ |

## Bibliotecas (package.json)

| Lib | Versão | Função |
|-----|--------|--------|
| `react` | 18 | UI |
| `three` | 0.169 | 3D engine |
| `@react-three/fiber` | 8.17 | R3F |
| `@react-three/drei` | 9.114 | R3F helpers |
| `@react-three/postprocessing` | 2.16 | Bloom, vignette, etc. |
| `zustand` | 4.5 | State management |

**Dependências para adicionar nesta sprint**: nenhuma (manter
leve).

## Gaps Críticos Para Crescer

1. **State único monolítico** — não suporta separação alma/corpo
   necessária para reencarnação
2. **Sem persistência** — não há save, jogador perde tudo ao
   recarregar
3. **Sem customização** — começa direto na cena
4. **Sem cinemáticas** — pulando diretamente para gameplay
5. **Centelha não-visual** — número no HUD, mas não orbe no
   peito como bíblia define
6. **Sem flow de fases macro** — App.tsx tem fases narrativas
   mas falta meta-flow (Title → Customization → Prólogo → Game)

## Decisões Arquitetônicas Tomadas

### 1. Multi-store Zustand

Separar state em 4 stores especializados:

- **`gameStore`**: estado da sessão atual (fase, diálogo, toast)
- **`soulStore`**: estado da ALMA persistente entre vidas
  (centelhas, lendários, alinhamento)
- **`characterStore`**: estado do CORPO atual (sexo, aparência,
  origem, disposição) — zera a cada reencarnação
- **`cinematicStore`**: cinemáticas vistas, em curso, skipáveis

### 2. SaveSystem v1

- **Camada 1**: localStorage para tudo agora (1-3 MB JSON
  suficiente)
- **Camada 2 (futuro)**: IndexedDB quando passar de 10 MB
- **Schema versionado**: `{version: 1, soul: {...}, character:
  {...}, cinematics: {...}, ...}`
- **Migration system**: para quando schema mudar entre versões

### 3. Centelha em 8 Fases

Componente 3D na posição do peito do Player, **escala visual
proporcional à Luz Interior**:

- Fase 1 (0.0-1.0 Luz): orbe 1cm, intensidade baixa
- Fase 2 (1.0-2.0): 3cm, dourado quente
- Fase 3 (2.0-3.5): 6cm, dourado intenso + asas tênues
- Fase 4 (3.5-5.0): 10cm + asas semi-visíveis
- Fase 5 (5.0-6.5): 15cm + asas plenas
- Fase 6 (6.5-7.5): 20cm + coroa
- Fase 7 (7.5-8.5): 30cm + aura 50m
- Fase 8 (8.5+): sem orbe, corpo é luz

### 4. CinematicPlayer Placeholder

**Até CGI real**, cinemáticas são **texto narrado** sobre fundo
estilizado:
- Fundo cinematográfico simples (gradient + partículas)
- Texto narrativo aparecendo em tipografia Cinzel/Cormorant
- Música procedural simples
- Player pode pular (com aviso) ou ler tudo
- Cada cinemática salva como "vista" para skipar em
  replays

## Riscos Conhecidos Para Sprint 1

| Risco | Mitigação |
|-------|-----------|
| Quebrar o gameplay atual | Refatorar com cuidado, testar manual após cada passo |
| Save schema instável | Versionar desde o início, suportar migrations |
| Type errors em Zustand | TypeScript estrito, definir interfaces antes de implementar |
| State explosion | Manter cada store **pequeno e focado** |

---

Próximo: [`02-sprint-board.md`](02-sprint-board.md)
