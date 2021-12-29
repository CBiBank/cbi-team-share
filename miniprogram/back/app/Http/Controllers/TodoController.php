<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\Minip\TodoService;

class TodoController extends Controller {
    public function getTodoList(Request $request) {
        return TodoService::getInstance()->getTodoList($request);
    }
    public function getTodoLikeList(Request $request) {
        return TodoService::getInstance()->getTodoLikeList($request);
    }

    public function addTodo(Request $request) {
        return TodoService::getInstance()->addTodo($request);
    }

}
