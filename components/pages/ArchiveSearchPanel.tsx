export function ArchiveSearchPanel() {
  return (
    <section className="archiveSearch terminalPanel">
      <div>
        <span>Pesquisa de arquivo</span>
        <input placeholder="Pesquisar por Operação Prato, Dyatlov, Ubatuba..." />
      </div>
      <div className="filterRow">
        <button>Todos</button>
        <button>OVNIs</button>
        <button>Desaparecimentos</button>
        <button>Brasil</button>
        <button>Relatos</button>
      </div>
    </section>
  );
}
