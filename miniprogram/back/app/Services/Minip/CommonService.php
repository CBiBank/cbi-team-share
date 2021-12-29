<?php
 namespace App\Services\Minip;


class CommonService {

    static public $StatusCode = [
        'SUCCESS'   =>   [
            'code' => 200,
            'msg' => '请求成功'
        ]
    ];
    static public function sendData($status_code='', $data = [])
    {
        $return = [
            'code' => self::$StatusCode[$status_code]['code'],
            'msg' => self::$StatusCode[$status_code]['msg'],
        ];
        if (!empty($data)) {
            $return['data']=$data;
        }
        return json_encode($return,JSON_UNESCAPED_UNICODE);
    }
}
