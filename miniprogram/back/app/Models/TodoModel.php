<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TodoModel extends Model
{
    //
    protected  $table = 'todo';
    public $timestamps = false;


    public function getList($condition, $options=['*'],$get_type='get'){
        $result = $this->where($condition);
        if ($get_type=='get'){
            return $result->get($options)->toArray();
        }elseif ($get_type=='pick'){
            return $result->pluck($options[0])->toArray();
        }
    }

    public function getValue($condition,$value){
        return $this->where($condition)->value($value);
    }

    public function updateValue($condition,$options){
        return $this->where($condition)->update($options);
    }
}
