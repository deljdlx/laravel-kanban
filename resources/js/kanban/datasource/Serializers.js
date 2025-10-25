// Stateless serializers for Columns and Tickets

export const ColumnSerializer = {
  toDTO(col) {
    if (!col) return null;
    if (typeof col.toJSON === 'function') return col.toJSON();
    return { id: col.id, name: col.name, tickets: Array.isArray(col.tickets) ? col.tickets : [] };
  },
  fromDTO(dto) {

    console.group('%cSerializers.js :: 11 =============================', 'color: #845047; font-size: 1rem');
    console.log(dto);
    console.groupEnd();



    if (!dto) return null;
    // Utilise Column.fromJSON pour garantir la structure et les tickets/commentaires
    return Column.fromJSON(dto);
  }
};

export const TicketSerializer = {
  toDTO(t) {
    if (!t) return null;
    if (typeof t.toJSON === 'function') return t.toJSON();
    return { ...t };
  },
  fromDTO(dto) {
    if (!dto) return null;
    // Utilise Ticket.fromJSON pour garantir la structure et les commentaires
    return Ticket.fromJSON(dto);
  }
};
