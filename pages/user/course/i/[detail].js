import { Add, Delete, Edit } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Unstable_Grid2 as Grid, Stack, Breadcrumbs, Typography, Button, Box, Tab, LinearProgress } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { miliSecToDateOnly, sendAuthGetRequest } from "../../../../common/utils";
import UserLayout from "../../../../component/layout/UserLayout";
import DeleteIMark from "../../../../component/user/course/i/DeleteIMark";
import EditIMark from "../../../../component/user/course/i/EditIMark";
import StudentIMark from "../../../../component/user/course/i/StudentIMark";
import { setCurrentPage } from "../../../../features/pathSlice";

const IMarkDetail = () => {

    const account = useSelector(state => state.user.account);
    const dispatch = useDispatch();
    const router = useRouter();
    const {detail} = router.query;
    const [currentSemester, setCurrentSemester] = useState(null);
    const [tab, setTab] = useState("1");
    const [open, setOpen] = useState(false);
    const [onProcess, setOnProcess] = useState(false);
    const [reload, setReload] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const [imarkData, setImarkData] = useState(null);

    useEffect(() => {
        dispatch(setCurrentPage("course"));
    });

    useEffect(() => {
        getCurrentSemester();
    }, []);

    useEffect(() => {
        if(detail) {
            getImarkData();
        }
    }, [detail]);

    useEffect(() => {
        if(reload) {
            getImarkData();
        }
    }, [reload]);

    const getCurrentSemester = async () =>{
        let result = await sendAuthGetRequest("/api/semester/current");
        if(result.status === 200) {
            setCurrentSemester(result.data);
        }
    }

    const getImarkData = async () =>{
        setOnProcess(true);
        let result = await sendAuthGetRequest("/api/course/imark?id="+detail);
        console.log(result);
        if(result.status == 200){
            setOnProcess(false);
            setImarkData(result.data);
        }else{
            setOnProcess(false);
        }
    }

    return (
        <Stack direction={"column"} spacing={1} sx={{
            width: `100%`,
            height: `100%`
        }}>
        {openDelete? <DeleteIMark open={openDelete} setOpen={setOpenDelete} data={imarkData} />: <></>}
        {open? <EditIMark setReload={setReload} setOpen={setOpen} data={imarkData} />: <></>}
         <Grid container width={"100%"} alignItems="center">
            <Grid xs={12} md={8} lg={9}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/user">
                    Trang ch???
                    </Link>
                    <Link underline="hover" color="inherit" href="/user/course">
                    Nh??m h???c ph???n
                    </Link>
                    <Link underline="hover" color="inherit" href="/user/course/i">
                    ??i???m I
                    </Link>
                    <Typography color="text.primary">Chi ti???t</Typography>
                </Breadcrumbs>
            </Grid>
            <Grid xs={12} md={4} lg={3}>
            {imarkData && imarkData.lecturer.account == account? <Stack direction={"row"} gap={1}>
                <Button variant="contained" onClick={() => {setOpen(true)}} component="label" startIcon={<Edit/>}>
                    Ch???nh s???a
                </Button>
                <Button variant="contained" color="error" onClick={() => {setOpenDelete(true)}} component="label" startIcon={<Delete/>}>
                    Xo??
                </Button>
            </Stack>: <></>}
            </Grid>
         </Grid>
        <Typography variant="h5">Chi ti???t v??? ??i???m I {imarkData? "c???a sinh vi??n " + imarkData.student.name: ""}</Typography>
        <TabContext value={tab} sx={{
            width: `100%`,
            height: `100%`
        }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(e, v) => {setTab(v)}} aria-label="lab API tabs example">
                <Tab label="????n ??i???m I" value="1" />
                <Tab label="H??nh ???nh" value="2" />
              </TabList>
            </Box>
            {onProcess? <LinearProgress />: <></>}
            <TabPanel value="1" sx={{
                width: `100%`,
                height: `100%`,
                overflow: `auto`,
                }}>
                    <StudentIMark data={imarkData} />
            </TabPanel>
            <TabPanel value="2" sx={{
                width: `100%`,
                height: `100%`
                }}>
                    <div style={{position: `relative`, width: `100%`, height: `100%`}}>
                        {imarkData? <Image src={imarkData.document.viewUrl} layout='fill' objectFit="contain" alt=""/>: <></>}
                    </div>
            </TabPanel>
          </TabContext>
        </Stack>
    )
}

IMarkDetail.Layout = UserLayout;

export default IMarkDetail;