import { Check, Delete } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Breadcrumbs, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, LinearProgress, Tab, Typography, Unstable_Grid2 as Grid } from "@mui/material";
import { Stack } from "@mui/system";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { errorNotify, successNotify } from "../../../common/toastify";
import { sendAuthGetRequest, sendAuthPostResquest } from "../../../common/utils";
import AllCourse from "../../../component/admin/user/AllCourse";
import UserLog from "../../../component/admin/user/UserLog";
import AdminLayout from "../../../component/layout/AdminLayout";
import { setCurrentPage } from "../../../features/pathSlice";


const UserDetail = () =>{

    const router = useRouter();
    const { detail } = router.query;
    const [tab, setTab] = useState('1');
    const dispatch = useDispatch();

    const [userData, setUserData] = useState(null);
    const [onProcess, setOnProcess] = useState(false);

    const [openDelete, setOpenDelete] = useState(false);
    const [openActivate, setOpenActivate] = useState(false);
    const [reloadLog, setReloadLog] = useState(false);

    useEffect(() =>{
        dispatch(setCurrentPage("user"));
    });

    useEffect(() => {
        if(detail && userData == null) {
            getUserData(detail);
        }
    }), [detail, userData]; 

    const getUserData = async (id) =>{
        setOnProcess(true);
        let result = await sendAuthGetRequest(`/api/user?id=${id}`);
        console.log(result);
        if(result.status === 200 ){
            setUserData(result.data);
            setOnProcess(false);
        }
    }

    const displayFunctionBtn = () =>{
        if(userData) {
            if(!userData.role.includes("2") || !userData.role.includes("3")){
                if(userData.statusCode == 3){
                    return (
                        <Button size="medium" variant="contained" onClick={() => {setOpenDelete(true)}} color={"error"} startIcon={<Delete />}>
                            V?? hi???u ho??
                        </Button>
                    )
                } else if (userData.statusCode ==  2){
                    return (
                        <Button size="medium" variant="contained" onClick={() => {setOpenActivate(true)}} color={"primary"} startIcon={<Check />}>
                            K??ch ho???t
                        </Button>
                    )
                }
            }
        }
    }

    const deActive = async () => {
        let formData = new FormData();
        setOpenDelete(false);
        formData.append("account", userData.account);
        let res = await sendAuthPostResquest("/api/user/disabled", formData);
        if(res.status == 200) { 
            successNotify("V?? hi???u ho?? t??i kho???n ng?????i d??ng th??nh c??ng.");
            getUserData(detail);
            setReloadLog(true);
        } else {
            errorNotify("???? c?? l???i x???y ra, vui l??ng th???c hi???n l???i.");
        }
    }

    const activate = async () => {
        let formData = new FormData();
        setOpenActivate(false);
        formData.append("account", userData.account);
        let res = await sendAuthPostResquest("/api/user/enabled", formData);
        if(res.status == 200) { 
            successNotify("K??ch ho???t t??i kho???n ng?????i d??ng th??nh c??ng.");
            setReloadLog(true);
            getUserData(detail);
        } else {
            errorNotify("???? c?? l???i x???y ra, vui l??ng th???c hi???n l???i.");
        }
    }

    return (
        <Stack direction={"column"} gap={1} sx={{
            width: `100%`,
            height: `100%`,
        }}>
            <Dialog
                open={openDelete}
                onClose={e => setOpenDelete(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"V?? hi???u ho?? t??i kho???n."}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    X??c nh???n v?? hi???u ho?? t??i kho???n c???a ng?????i d??ng {userData? userData.name: ""}. N???u b??? v?? hi???u ho??, ng?????i d??ng s??? kh??ng th??? s??? d???ng h??? th???ng v?? c???n ph???i ???????c k??ch ho???t b???i ng?????i d??ng qu???n l??
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button color="primary" onClick={e => setOpenDelete(false)}>Hu???</Button>
                <Button color="error" onClick={e => deActive()} autoFocus>
                    V?? hi???u ho??
                </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openActivate}
                onClose={e => setOpenActivate(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"K??ch ho???t t??i kho???n."}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    X??c nh???n k??ch ho???t t??i kho???n c???a ng?????i d??ng {userData? userData.name: ""}. Sau khi ???????c k??ch ho???t, ng?????i d??ng c?? th??? s??? d???ng l???i c??c ch???c n??ng c???a h??? th???ng.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button color="primary" onClick={e => setOpenActivate(false)}>Hu???</Button>
                <Button color="success" onClick={e => activate()} autoFocus>
                    K??ch ho???t
                </Button>
                </DialogActions>
            </Dialog>
            <Grid container width={"100%"} alignItems="center">
                <Grid md={9} lg={10} xl={10.5}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                        Trang ch???
                        </Link>
                        <Link underline="hover" color="inherit" href="/admin/user">
                        Ng?????i d??ng
                        </Link>
                        <Typography color="text.primary">Chi ti???t</Typography>
                    </Breadcrumbs>
                </Grid>
                <Grid md={3} lg={2} xl={1.5}>
                    {displayFunctionBtn()}
                </Grid>
            </Grid>
            <Typography variant="h5">{userData == null? "Ng?????i d??ng": `${userData.title}. ${userData.name}`}</Typography>
            <Divider />
            {onProcess? <LinearProgress />:<></>}
            <Grid container spacing={2} sx={{width: `100%`}}>
                    <Grid xs={12} md={5}>
                        <Typography>{`MSGV: ${userData? userData.account : ""}`}</Typography>
                    </Grid>
                    <Grid xs={12} md={5}>
                        <Typography>{`Email: ${userData? userData.email: ""}`}</Typography>
                    </Grid>
                    <Grid xs={12} md={5}>
                        <Typography>{`S??? ??i???n tho???i: ${userData? userData.phone: ""}`}</Typography>
                    </Grid>
                    <Grid xs={12} md={5}>
                        <Typography>{`Vai tr??: ${userData? userData.fullRole : ""}`}</Typography>
                    </Grid>
                    <Grid xs={12}>
                        <Stack direction="row" alignItems={"center"} gap={2}><Typography>Tr???ng th??i: </Typography> 
                            {userData? <Chip label={userData.status} color={userData.statusCode == "1"? "info": userData.statusCode == "2"? "error": "primary"}/>: <></>}
                        </Stack>
                    </Grid>
            </Grid>
            <TabContext value={tab} sx={{
                width: `100%`,
                height: `100%`
            }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={(e, v) => {setTab(v)}} aria-label="lab API tabs example">
                    <Tab label="L???ch s??? ng?????i d??ng" value="1" />
                    <Tab label="L???p h???c" value="2" />
                </TabList>
                </Box>
                <TabPanel value="1" sx={{
                    width: `100%`,
                    height: `100%`
                    }}>
                        {userData? <UserLog userId={userData.id} reload={reloadLog} setReload={setReloadLog}/>: <></>}
                </TabPanel>
                <TabPanel value="2" sx={{
                    width: `100%`,
                    height: `100%`
                    }}>
                        {userData?<AllCourse account={userData.account}/>: <></>}
                </TabPanel>
            </TabContext>
        </Stack>
    )
}

UserDetail.Layout = AdminLayout;
export default UserDetail;