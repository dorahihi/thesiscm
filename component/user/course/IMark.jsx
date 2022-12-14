import { Unstable_Grid2 as Grid, Typography, TextField, Box } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { getData } from "../../../common/localStorage";
import { miliSecToDateOnly, sendAuthGetRequest } from "../../../common/utils";


const IMark = ({account, student, reason, setReason, lecturerComment, deanComment, setLecturerComment, setDeanComment, other, setOther,
                userData, setUserData, studentData, setStudentData}) => {

    const [semester, setSemester] = useState(null);

    useEffect(() => {
        if(student) {
            getStudentData();
        }
    }, [])

    useEffect(() => {
        getSemester();
    }, []);

    useEffect(() => {
        if(account) {
            setUserData(JSON.parse(getData("user")));
        }
    }, [])

    const getStudentData = async () =>{
        let result = await sendAuthGetRequest("/api/student?id=" + student);
        if (result.status == 200) {
            setStudentData(result.data);
        }
    }

    const onPhoneNumberChange = (value) => {
        let arr = [...other];
        arr[0] = value;
        setOther(arr);
    }

    const onDateChange = (value) =>{
        let arr = [...other];
        arr[1] = value;
        setOther(arr);
    }

    const onMonthChange = (value) => {
        let arr = [...other];
        arr[2] = value;
        setOther(arr);
    }

    const onYearChange = (value) => {
        let arr = [...other];
        arr[3] = value;
        setOther(arr);
    }

    const getSemester = async () =>{
        let result = await sendAuthGetRequest("/api/semester/current");
        if(result.status == 200) {
            setSemester(result.data);
        }
    }

    const generate = (studentCode) =>{
        let a = parseInt(studentCode.substring(1, 3));
        return `${(a - 18 + 44)} (20${a} - 20${a + 4})`
    }

    return (
    <Box sx={{width: `100%`, height: `100%`, overflow: `auto`}}>
        <Stack direction={"column"} gap={4} sx={{maxWidth: `750px`,padding: `3%`, mx:`auto`, paddingBottom: `100px`}}>
            <Stack direction={"column"} sx={{width: `100%`}} alignItems="center"> 
                <Typography sx={{fontWeight: `bold`}}>C???NG H??A X?? H???I CH??? NGH??A VI???T NAM</Typography>            
                <Typography sx={{fontWeight: `bold`, textDecoration: `underline`}}>?????c l???p - T??? do - H???nh ph??c</Typography>            
            </Stack>
            <Typography sx={{textAlign: `center`, fontSize: `16pt`, fontWeight: `bold`, }}>????N XIN PH??P V???NG THI K???T TH??C H???C PH???N</Typography>
            <Grid container sx={{width: `100%`, marginLeft: `50px`}}>
                <Grid xs={1.5}>
                    <Typography sx={{fontSize: `14pt`}}>K??nh g???i:</Typography>
                </Grid>
                <Grid xs={7}>
                    <Typography sx={{fontSize: `14pt`}}><span style={{fontWeight: `bold`}}>- Qu?? Th???y/C?? gi???ng d???y h???c ph???n</span> </Typography>
                    <Typography sx={{fontSize: `14pt`}}><span style={{fontWeight: `bold`}}>  Lu???n v??n t???t nghi???p ng??nh K??? thu???t ph???n m???m</span> </Typography>
                    <Typography sx={{fontSize: `14pt`}}><span style={{fontWeight: `bold`}}>- Ban Ch??? nhi???m Khoa C??ng ngh??? ph???n m???m </span></Typography>
                </Grid>
            </Grid>
            <Stack direction={"column"} gap={1} sx={{width: `100%`}}>
                <Stack direction="row" sx={{width: `100%`}}>
                    <Typography sx={{width: `52%`}}>T??i t??n : {studentData? studentData.name: ""}</Typography>
                    <Typography sx={{width: `40%`}}>M?? s??? sinh vi??n: {studentData? studentData.studentCode: ""}</Typography>
                </Stack>
                <Typography>Ng??y sinh : {studentData? miliSecToDateOnly(studentData.dateOfBirth): ""}</Typography>
                <Stack  direction="row" sx={{width: `100%`}}>
                    <Typography sx={{width: `52%`}}> Ng??nh h???c  : K??? thu???t ph???n m???m </Typography>
                    <Typography> Kho??: {studentData? generate(studentData.studentCode):"(20  - 20   )"} </Typography>
                </Stack>
                <Typography>
                S??? ??i???n tho???i li??n h???:  
                <input type="text" value={other[0]} onChange={e => onPhoneNumberChange(e.target.value)} style={{textAlign: `left` ,width: `65%`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input>
                </Typography>
                <Typography>
                <span style={{paddingLeft: `30px`}}>T??i k??nh g???i ????n n??y ?????n Ban Ch??? nhi???m Khoa, Ph??ng ????o t???o v?? qu?? Th???y/C?? gi???ng </span>
                d???y h???c ph???n: Lu???n v??n t???t nghi???p ng??nh K??? thu???t ph???n m???m. M?? s??? HP: CT594, cho ph??p t??i kh??ng thi k???t th??c h???c ph???n, ???????c b???o l??u k???t qu??? ????nh gi?? gi???a k??? 
                v?? nh???n ??i???m I cho h???c ph???n n??y trong h???c k??? {semester? semester.semesterCode == '1'? "I": "II": ""}, n??m h???c: {semester? semester.startYear + " - " + semester.endYear + ". ": ""}
                 Trong th???i h???n 1 n??m ti???p theo, t??i s??? d??? thi ????? ho??n t???t ??i???m h???c ph???n. N???u qu?? th???i h???n tr??n, t??i kh??ng ho??n t???t ??i???m h???c ph???n n??y th?? ??i???m I s??? ???????c  
                 <b> chuy???n th??nh ??i???m F</b>.   
                </Typography>
                <Grid container sx={{width: `100%`}}>
                    <Grid ><Typography sx={{marginLeft: `30px`}}>L?? do v???ng thi:</Typography></Grid>
                    <Grid xs={9}>
                    <TextField color="secondary" value={reason} onChange={e => setReason(e.target.value)} multiline maxRows={15} fullWidth variant="standard"/>
                    </Grid>
                </Grid>
                <Typography sx={{marginLeft: `30px`}}><i>(????nh k??m gi???y x??c nh???n minh ch???ng l?? do).</i></Typography>
                <Typography sx={{marginLeft: `30px`}}>K??nh mong ???????c s??? ch???p thu???n c???a qu?? Th???y, C??</Typography>
                <Typography sx={{marginLeft: `30px`}}>Ch??n th??nh c???m ??n v?? k??nh ch??o tr??n tr???ng.</Typography>
            </Stack>
            <Grid container sx={{width: `100%`, marginTop: `30px`}}>
                    <Grid xs={5}>
                        <Stack direction="column" alignItems={"center"} sx={{width: `100%`}}>
                        <Typography sx={{visibility: `hidden`}}><b>?? ki???n CBGD </b></Typography>
                        <Typography><b>?? ki???n CBGD </b></Typography>
                        <TextField color="secondary" value={lecturerComment} onChange={e => setLecturerComment(e.target.value)} multiline maxRows={15} fullWidth variant="standard"/>
                        </Stack>
                    </Grid>
                    <Grid xs={7}>
                        <Stack direction="column" alignItems={"center"} sx={{width: `100%`}}>
                        <Typography><i>C???n Th?? ,
                            ng??y <input type="text" value={other[1]} onChange={e => onDateChange(e.target.value)} style={{textAlign: `center` , width: `30px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input>
                            th??ng <input type="text" value={other[2]} onChange={e => onMonthChange(e.target.value)} style={{textAlign: `center` , width: `30px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input>
                            n??m <input type="text" value={other[3]} onChange={e => onYearChange(e.target.value)} style={{textAlign: `center` , width: `50px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input></i></Typography>
                        <Typography><b>Ng?????i vi???t ????n</b></Typography>
                        <span type="text" style={{textAlign: `center` , marginTop: `60px`,width: `200px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}>
                            {studentData? studentData.name: ""}
                        </span>
                        </Stack>
                    </Grid>
                </Grid>
                <Stack direction={"column"} sx={{width: `100%`}} alignItems="center">
                    <Typography><b>?? ki???n c???a Tr?????ng Khoa</b></Typography>
                    <TextField color="secondary" multiline value={deanComment} onChange={e => setDeanComment(e.target.value)} maxRows={15} fullWidth variant="standard"/>
                </Stack>
        </Stack>
    </Box>
    )
}

export default IMark;