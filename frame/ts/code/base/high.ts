type MENU = "MENU" | "BUTTON";

type MaybeNull<T> = {
    [k in keyof T]: null | T[k]
}

interface Data {
  id: number;
  available: boolean;
  permission: string | unknown;
  description: string;
  type: MENU;
  parentId: number;
  parentName: string | null;
  showOrder: number;
  createTime: string;
  updateTime: string;
  childList: Data[] | undefined;
}

type MyData = MaybeNull<Data>

interface IResponse {
  code: string;
  data: Data;
  msg: string;
}






const response: IResponse = {
  code: "SUCCESS",
  msg: "",
  data: {
    id: 1,
    available: true,
    permission: "/",
    description: "根节点",
    type: "MENU",
    parentId: 0,
    parentName: null,
    showOrder: 100,
    createTime: "2019-12-04 02:45:36",
    updateTime: "2019-12-04 02:45:36",
    childList: [
        {
            id: 1,
            available: true,
            permission: "/",
            description: "根节点",
            type: "MENU",
            parentId: 0,
            parentName: null,
            showOrder: 100,
            createTime: "2019-12-04 02:45:36",
            updateTime: "2019-12-04 02:45:36",
            childList: []
        }
    ],
  },
};


response.data.childList.forEach(item => {
    item.childList
})


const response2 = {} as IResponse

response2.data.childList