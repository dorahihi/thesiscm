import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { sendAuthGetRequest, sendAuthPostResquest } from "../../../common/utils";

const EditAccount = ({userData = null, setReload, open = false, setOpen}) => {

    const [userTitles, setUserTitles] = useState([]);
    const [title, setTitle] = useState(userData? userData.titleCode: "1");
    const [name, setName] = useState(userData? userData.name: "");
    const [phone, setPhone] = useState(userData? userData.phone: "");
    const [email, setEmail] = useState(userData? userData.email: "");

    const [nameValid, setNameValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [phoneValid, setPhoneValid] = useState(true);

    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const [onProcess, setOnProcess] = useState(false);

    const handleClose = () =>{
        setIsError(false);
        setIsSuccess(false);
        setOnProcess(false);
        setOpen(false);
    }

    useEffect(() => {
        getTitle();
    }, []);

    const getTitle = async () =>{
        let res = await sendAuthGetRequest("/api/user/title");
        if(res.status === 200){
            let arr = [];
            Object.keys(res.data).map((key) =>{
                arr.push({value: key, label: res.data[key]});
            });
            setUserTitles(arr);
        }
    }

    const register = async () =>{
        setIsError(false);
        setIsSuccess(false);
        setOnProcess(true);
        if(validate()){
            setOnProcess(true);
            let data = new FormData();
            data.append("account", userData.account);
            data.append("name", name);
            data.append("email", email);
            data.append("phone", phone);
            data.append("title", title);

            let res = await sendAuthPostResquest("/api/user/update", data);
            if(res.status === 200) {
                setIsSuccess(true);
                setOnProcess(false);
                setMessage("Ch???nh s???a th??nh c??ng!");
                setReload(true);
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else{
                setOnProcess(false);
                setIsError(true);
                setMessage("???? c?? l???i x???y ra!");
            }
        }
    }

    const validate = () =>{
        let result = true;
        if(name === "") {
            result = false;
            setNameValid(false);
        }
        if(email === "") {
            result = false;
            setEmailValid(false);
        }
        if(!email.includes("@")){
            result = false;
            setEmailValid(false);
        }
        if(phone !== "" && phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im) === null) {
            result = false;
            setPhoneValid(false);
        }

        return result;
    }

    return (
        <Dialog open={open} onClose={handleClose}>
        <DialogTitle>C???p nh???t th??ng tin t??i kho???n</DialogTitle>
        <DialogContent>
          <Stack direction="column" gap={2}>
          <DialogContentText>
            ?????m b???o th??ng tin b???n cung c???p tr??ng kh???p v???i th??ng tin ???????c l??u trong c?? s??? d??? li???u c???a tr?????ng
          </DialogContentText>
          {isError? <Alert severity="error">{message}</Alert>: <></>}
          {isSuccess? <Alert severity="success">{message}</Alert>: <></>}
          <TextField error={!nameValid} helperText={nameValid? "": "H??? t??n kh??ng h???p l???"} required value={name} onChange={(e) => setName(e.target.value)} label="H??? t??n" fullWidth variant="outlined"/>
          <TextField error={!emailValid} helperText={emailValid? "": "Email kh??ng h???p l???"} required value={email} onChange={(e) => setEmail(e.target.value)} label="Email" fullWidth variant="outlined"/>
          <TextField error={!phoneValid} helperText={phoneValid? "": "S??? ??i???n tho???i kh??ng h???p l???"} required value={phone} onChange={(e) => setPhone(e.target.value)} label="S??? ??i???n tho???i" fullWidth variant="outlined"/>
          <TextField fullWidth color="secondary" select={userTitles.length > 0} required value={title} onChange={(e) => {setTitle(e.target.value)}} label="H???c h??m/ H???c v???">
                    {userTitles.length > 0 ? userTitles.map((option) => (
                        <MenuItem  key={option.value+option.label.replace(/\s/, "")} value={option.value}>
                        {option.label}
                        </MenuItem >
                    )): <></>}
                    </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={handleClose}>Hu???</Button>
          <Button onClick={register}>L??u</Button>
        </DialogActions>
      </Dialog>
    )
}

export default EditAccount;