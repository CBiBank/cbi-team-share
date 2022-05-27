type MENU = "MENU" | "BUTTON";

type MaybeNull<T> = {
    [k in keyof T]: T[k] | null
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
  childList: Data[] | null;
}


interface IResponse {
  code: string;
  data: MaybeNull<Data>;
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
            childList: null
        }
    ],
  },
};

response.data.id?.toFixed()

response.data.childList.forEach(item => {
    item.childList.forEach
})


const response2 = {} as IResponse

response2.data.childLists
