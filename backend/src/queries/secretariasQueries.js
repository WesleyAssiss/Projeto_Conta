const getSecretarias = (status) => {
    let query = "SELECT * FROM secretarias";
    if (status) {
        query += ` WHERE status = '${status}'`;
    }
    query += " ORDER BY nome ASC";
    return query;
};
const getSecretariaById = "SELECT * FROM secretarias WHERE id = $1";
const checkNomeExists = "SELECT s FROM secretarias s WHERE s.nome = $1";
const addSecretaria = "INSERT INTO secretarias (nome, status) VALUES ($1, $2) RETURNING *";
const deleteSecretaria = "DELETE FROM secretarias WHERE id = $1";
const updateSecretaria = "UPDATE secretarias SET nome = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *";

module.exports = {
    getSecretarias,
    getSecretariaById,
    checkNomeExists,
    addSecretaria,
    deleteSecretaria,
    updateSecretaria,
};