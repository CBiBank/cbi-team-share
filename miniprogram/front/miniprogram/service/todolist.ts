const http = require('./http')


function apiGetTodoList() {
    return http.get('/todo/list')
}
function apiGetTodoLikeList() {
    return http.get('/todo/likelist')
}

function apiAddTodoItem(data: { todoName: string; todoContent: string }) {
    return http.post('/todo/add', data)
}

module.exports = {
    apiGetTodoList,
    apiAddTodoItem,
    apiGetTodoLikeList
}