import { Alert, Button, Divider, LinearProgress, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Box, Stack } from "@mui/system";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUserInfo, setData } from "../../common/localStorage";
import { errorNotify, notify } from "../../common/toastify";
import { sendAuthGetRequest, sendLoginRequest } from "../../common/utils";
import { resetLoginStatus, setAccount, setIsLoggedIn, setIsLoggedOut, setLoginFail, setLoginSuccess, setUserData } from "../../features/userSlice";

export default function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const loginSuccess = useSelector(state => state.user.loginSuccess);
    const loginFail = useSelector(state => state.user.loginFail);
    const isUserLoggedIn = useSelector(state => state.user.isLoggedIn);
    const isUserLoggedOut = useSelector(state => state.user.isLoggedOut);
    const [onProcess, setOnProcess] = useState(false);
    const [account, setUserAccount] = useState("");
    const [password, setPassword] = useState("");
    const [isAccountValid, setIsAccountValid] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    
    useEffect(() =>{
      if(isUserLoggedIn && !isUserLoggedOut){
         router.push("/");
      }
    }, [isUserLoggedIn, isUserLoggedOut]);

    useEffect( () =>{
       if(loginSuccess) {
          getUserData();
       }
    }, [loginSuccess]);

    const getUserData = async () =>{
      let result = await sendAuthGetRequest("/api/user/account?account="+account);
      if(result.status === 200) {
        dispatch(setUserData(result.data));
        setData("user", JSON.stringify(result.data));
        dispatch(setLoginSuccess(false));
        dispatch(setIsLoggedIn(true));
        router.push("/");
      }else {
        dispatch(resetLoginStatus());
        removeUserInfo();
        errorNotify("???? x???y ra l???i trong l??c truy xu???t th??ng tin ng?????i d??ng!")
      }
    }

    const validateData = () =>{
      let result = true;
      if(account === "") {
        setIsAccountValid(false);
        result = false;
      }

      if(password === "") {
        setIsPasswordValid(false);
        result = false
      }

      return result;
    }

    const resetValidation = () => {
      setIsAccountValid(true);
      setIsPasswordValid(true);
    }

    const login = async () =>{
      resetValidation();
      if(validateData()) {
        setOnProcess(true);
        dispatch(resetLoginStatus());
        let formData = new FormData();
        formData.append("account", account);
        formData.append("password", password);
        let result = await sendLoginRequest(formData);
        if(result.status === 200) {
          setData("account", account);
          dispatch(setAccount(account));
          setData("token", result.authorization);
          dispatch(setLoginSuccess(true));
          dispatch(setIsLoggedOut(false));
          setOnProcess(false);
        } else {
          dispatch(setLoginFail(true));
          setOnProcess(false);
        }
      }
    }
    
    return (
      <Box sx={{
        overflow: `hidden`,
        width: `100vw`,
        height: `100vh`,
        display: `flex`,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Paper elevation={5} sx={(theme) => ({
              backgroundColor: `background.paper`,
              height: `50vh`,
              width: `600px`,
              [theme.breakpoints.down("sm")]: {
                width: `98vw`
              }
            })}>
              <Stack direction="column"
                    spacing={3}
                    sx={{
                      p: `5%`,
                    }}>
                  <Box
                    sx={{
                      width: `100%`,
                      display: `flex`,
                      alignItems: 'center',
                      gap: `10px`
                      
                    }}
                  >
                    <Typography variant="h5">H??? th???ng h??? tr??? qu???n l?? lu???n v??n t???t nghi???p ng??nh K??? thu???t ph???n m???m</Typography>
                  </Box>
                  <Divider />
                  {onProcess? <LinearProgress />: <></>}
                  <Stack direction="column">
                  <Typography sx={theme => ({
                    fontSize: `1.5em`,
                    [theme.breakpoints.down("md")]:{
                      fontSize: '1.25em',
                    },
                  })}>????ng nh???p</Typography>
                  </Stack>
                    <Stack direction="column"
                    spacing={4}>
                      <TextField color="secondary" error={!isAccountValid} helperText={isAccountValid? "" : "M?? gi???ng vi??n kh??ng h???p l???"} required value={account} onChange={(e) => {setUserAccount(e.target.value)}} label="M?? gi???ng vi??n"/>
                      <TextField color="secondary" error={!isPasswordValid} type="password"  helperText={isPasswordValid? "" : "M???t kh???u kh??ng h???p l???"} required value={password} onChange={(e) => {setPassword(e.target.value)}} label="M???t kh???u"/>
                    </Stack>
                    <Box sx={{
                      display: `flex`,
                      flexDirection: `row`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: `250px`,
                    }}>
                      <Link href={"#"}><Typography sx={{
                        ":hover": {
                          cursor: `pointer`,
                          color: 'background.secondary'
                        }
                      }}><span style={{visibility: `hidden`}}>Qu??n m???t kh???u?</span></Typography></Link>
                      <Button disabled={onProcess} size="large" onClick={login} variant="contained">????ng nh???p</Button>
                    </Box>
                    
                  {loginFail? <Alert severity="error">T??i kho???n kh??ng t???n t???i ho???c m???t kh???u kh??ng h???p l???!</Alert>: <></>}
                  {loginSuccess? <Alert severity="primary">????ng nh???p th??nh c??ng!</Alert>: <></>}
              </Stack>
            </Paper>
      </Box>
    );
}