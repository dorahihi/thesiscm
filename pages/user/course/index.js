import { Add } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Unstable_Grid2 as Grid, Stack, Typography, Breadcrumbs, Button, Box, Tab, LinearProgress } from "@mui/material"
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendAuthGetRequest } from "../../../common/utils";
import UserLayout from "../../../component/layout/UserLayout";
import AllCourse from "../../../component/user/course/AllCourse";
import CourseDetail from "../../../component/user/course/CourseDetail";
import ImportStudent from "../../../component/user/course/ImportStudent";
import { setCourseLoading, setIsCurrentCourseExist } from "../../../features/courseSlice";
import { setCurrentPage } from "../../../features/pathSlice";

const User = () => {
    const account = useSelector(state => state.user.account);
    const courseLoading = useSelector(state => state.course.loading);
    const isCourseExist = useSelector(state => state.course.isCurrentCourseExist);
    const dispatch = useDispatch();
    const router = useRouter();
    const [tab, setTab] = useState('1');
    const [currentSemester, setCurrentSemester] = useState(null);
    const [open, setOpen] = useState(false);
    const [onProcess, setOnProcess] = useState(false);
    const [courseData, setCourseData] = useState(null);

    useEffect(() => {
        dispatch(setCurrentPage("course"));
    });

    useEffect(() => {
        getCurrentSemester();
    }, []);

    useEffect(() => {
        if(account) {
            getData();
        }
    }, [account]);

    useEffect(() => {
        if(courseLoading) {
            getData();
        }
    }, [courseLoading]);

    

    const getCurrentSemester = async () =>{
        let result = await sendAuthGetRequest("/api/semester/current");
        if(result.status === 200) {
            setCurrentSemester(result.data);
        }
    }

    const getData = async () => {
        setOnProcess(true);
        let result = await sendAuthGetRequest( `/api/course/account/current?account=${account}`);
        console.log(result);
        if(result.status === 200 ){
            setCourseData(result.data);
            setOnProcess(false);
            dispatch(setIsCurrentCourseExist(true));
            dispatch(setCourseLoading(false));
        } else {
            setOnProcess(false);
            dispatch(setIsCurrentCourseExist(false));
            dispatch(setCourseLoading(false));
        }
    }

    return (
        <Stack direction={"column"} spacing={1} sx={{
            width: `100%`,
            height: `100%`
        }}>
        {open ? <ImportStudent open={open} setOpen={setOpen}/> : <></>}
         <Grid container width={"100%"} alignItems="center">
            <Grid xs={12} md={8} lg={10}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/user">
                    Trang ch???
                    </Link>
                    <Typography color="text.primary">Nh??m h???c ph???n</Typography>
                </Breadcrumbs>
            </Grid>
            <Grid xs={12} md={4} lg={2}>
            {tab == 1 && isCourseExist ? courseData && courseData.lecturer.account == account ?<Stack direction={"row"} gap={1}>
                <Button variant="contained" onClick={() => {setOpen(true)}} component="label" startIcon={<Add/>}>
                    Nh???p danh s??ch sinh vi??n 
                </Button>
            </Stack>: <></>: <></>}
            </Grid>
         </Grid>
        <Typography variant="h5">Lu???n v??n t???t nghi???p - KTPM (CT594)</Typography>
        <TabContext value={tab} sx={{
            width: `100%`,
            height: `100%`
        }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                {onProcess? <LinearProgress />: <></>}
              <TabList onChange={(e, v) => {setTab(v)}} aria-label="lab API tabs example">
                <Tab label={currentSemester? currentSemester.semesterName : "H???c k??? hi???n t???i"} value="1" />
                <Tab label="T???t c???" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1" sx={{
                width: `100%`,
                height: `100%`
                }}>
                    {currentSemester  || onProcess? <CourseDetail courseData={courseData} isHome={true}/> : <Typography variant="h5">H???c k??? m???i v???n ch??a b???t ?????u</Typography>}
            </TabPanel>
            <TabPanel value="2" sx={{
                width: `100%`,
                height: `100%`
                }}>
                    <AllCourse />
            </TabPanel>
          </TabContext>
        </Stack>
    )
}

User.Layout = UserLayout;

export default User;