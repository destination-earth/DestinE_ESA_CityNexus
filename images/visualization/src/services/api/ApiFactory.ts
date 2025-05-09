import {ApiService} from "./ApiService";
import {selectUserToken} from "../../features/user/userSlice";

export class ApiFactory {
    public static build(state) {
        const userToken = selectUserToken(state);
        return new ApiService(userToken);
    }
}
