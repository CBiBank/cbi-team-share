<?php
namespace App\Services\Minip;

use App\Models\TodoModel;


class TodoService {
    private static $instance = null;

    public static function getInstance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    public function getTodoList($request){
        $TodoModel = new TodoModel();
        $condition = [];
        $info = $TodoModel->getList($condition);
        return CommonService::sendData('SUCCESS', $info);
    }

    public function getTodoLikeList($request){
        $TodoModel = new TodoModel();
        $condition = ['like' => 1];
        $info = $TodoModel->getList($condition);
        return CommonService::sendData('SUCCESS', $info);
    }



    public function addTodo($request){
        return $request;
        TodoModel::insert([
            'name'=> $request->todoName,
            'desc' => $request->todoContent
        ]);
        return CommonService::sendData('SUCCESS', []);
    }
}
