import { Save, Send } from "@mui/icons-material";
import { Alert, BottomNavigation, BottomNavigationAction, Button, Divider, LinearProgress, MenuItem, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, Unstable_Grid2 as Grid } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { errorNotify, successNotify } from "../../common/toastify";
import { convertNumberMarkToLetterMark, sendAuthGetRequest, sendAuthPostResquest } from "../../common/utils";
import { setPresentationGetLog, setPresentationReloadReport, setPresentationReportApproved } from "../../features/presentationSlice";

const Report = ({thesisData}) =>{
    const account = useSelector(state => state.user.account);
    const dispatch = useDispatch();
    const isReloadReport = useSelector(state => state.presentation.reloadReport);
    const isReportApproved = useSelector(state => state.presentation.isReportApproved);

    const [qna, setQna] = useState("");
    const [advices, setAdvices] = useState("");
    const [comment, setComment] = useState("");
    const [presentationResult, setPresentationResult] = useState("");
    const [otherThing, setOtherThing] = useState(["", "", "", ""]);
    const [endTime, setEndTime] = useState("");
    const [data, setData] = useState(null);

    const [presidentPoint, setPresidentPoint] = useState(0);
    const [secretaryPoint, setSecretaryPoint] = useState(0);
    const [memberPoint, setMemberPoint] = useState(0);
    const [totalPoint, setTotalPoint] = useState(0);

    const [userData, setUserData] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [open, setOpen] = useState(false);
    const [onProcess, setOnProcess] = useState(false);

    useEffect(() => {
        if(account && thesisData) {
            getData();
        }
    }, [account, thesisData]);

    useEffect(() => {
        if(isReloadReport)
            getData();
    }, [isReloadReport]);

    useEffect(() => {
        if(thesisData) {
            if(account == thesisData.president.account){
                setUserData({...thesisData.president});
            }
            if(account == thesisData.secretary.account){
                setUserData({...thesisData.secretary});
            }
            if(account == thesisData.member.account){
                setUserData({...thesisData.member});
            }
        }
    }, [thesisData])

    useEffect(() => {
        setTotalPoint(Math.round((((presidentPoint + secretaryPoint + memberPoint)/3) + Number.EPSILON) * 100) / 100);
    }, [presidentPoint, secretaryPoint, memberPoint]);

    const getData = async () => { 
        setOnProcess(true);
        let result = await sendAuthGetRequest("/api/report/presentaion?id="+thesisData.id);
        console.log(result);
        if(result.status == 200) {
            let tData = result.data;
            console.log(tData);
            setQna(tData.qna);
            setAdvices(tData.advices);
            setComment(tData.comment);
            setPresentationResult(tData.result);
            setTotalPoint(tData.finalPoint);
            setEndTime(tData.endTime);
            setOtherThing(tData.other.split(","));
            setData(tData);
            setOnProcess(false);
            getPoint();
            dispatch(setPresentationReloadReport(false));
            if(tData.approved) {
                dispatch(setPresentationReportApproved(true));
            }else{
                dispatch(setPresentationReportApproved(false));
            }
        } else {
            getPoint();
            dispatch(setPresentationReportApproved(false));
            dispatch(setPresentationReloadReport(false));
            setOnProcess(false);
        }
    }

    const getPoint = async () =>{
        let result = await sendAuthGetRequest("/api/point/report?id="+thesisData.id);
        console.log(result);
        if(result.status == 200) {
            result.data.forEach(element => {
                if(element.creator.account == thesisData.president.account){
                    let point = Math.round(((element.aTotalPoint + element.bTotalPoint + element.cTotalPoint) + Number.EPSILON) * 100) / 100;
                    setPresidentPoint(point);
                }
                if(element.creator.account == thesisData.secretary.account){
                    let point = Math.round(((element.aTotalPoint + element.bTotalPoint + element.cTotalPoint) + Number.EPSILON) * 100) / 100;
                    setSecretaryPoint(point);
                }
                if(element.creator.account == thesisData.member.account){
                    let point = Math.round(((element.aTotalPoint + element.bTotalPoint + element.cTotalPoint) + Number.EPSILON) * 100) / 100;
                    setMemberPoint(point);
                }
            });
        }
    }

    const submit = async () => {
        setOnProcess(true);
        let data = new FormData();
        data.append("qna", qna);
        data.append("advices", advices);
        data.append("comment", comment);
        data.append("result", presentationResult);
        data.append("finalPoint", totalPoint);
        data.append("presentation", thesisData.id);
        data.append("student", thesisData.student.id);
        data.append("account", account);
        data.append("other", otherThing.join(","));
        data.append("endTime", endTime);
        let result = await sendAuthPostResquest("/api/report/submit", data);
        if(result.status == 200) {
            setOnProcess(false);
            successNotify("G???i ??i th??nh c??ng"); 
            writeLogOnSubmit();
        } else {
            setOnProcess(false);
            errorNotify("???? c?? l???i x???y ra, vui l??ng th??? l???i");
        }
    }

    const writeLogOnSubmit = async () => {
        let message = data? data.submitted? userData.name + " ???? ch???nh s???a Bi??n b???ng ch???m ??i???m lu???n v??n.": userData.name + " ???? g???i Bi??n b???ng ch???m ??i???m lu???n v??n.": userData.name + " ???? g???i Bi??n b???ng ch???m ??i???m lu???n v??n.";
        let formData = new FormData();
        formData.append("id", thesisData.id);
        formData.append("content", message);
        let result = await sendAuthPostResquest("/api/presentation/log", formData);
        if(result.status == 200) {
            dispatch(setPresentationGetLog(true));
        }
    }

    const save = async () => {
        let data = new FormData();
        data.append("qna", qna);
        data.append("advices", advices);
        data.append("comment", comment);
        data.append("result", presentationResult);
        data.append("finalPoint", totalPoint);
        data.append("presentation", thesisData.id);
        data.append("account", account);
        data.append("endTime", endTime);
        data.append("student", thesisData.student.id);
        data.append("other", otherThing.join(","));
        let result = await sendAuthPostResquest("/api/report/save", data);
        if(result.status == 200) {
            successNotify("L??u th??ng tin th??nh c??ng");
        } else {
            errorNotify("L??u th??ng tin th???t b???i, vui l??ng th??? l???i");
        }
    } 

    const onOtherChange = (value, index) => {
        let arr = [...otherThing];
        arr[index] = value;
        setOtherThing(arr);
    }

    
    const actions = [
        { icon: <Send />, name: 'G???i ?????n ch??? t???ch h???i ?????ng', onClick: submit},
        { icon: <Save />, name: 'L??u th??ng tin', onClick: save },
      ];

    return (
        <Stack direction={"column"} gap={2} alignItems="center" sx={{maxWidth: `1000px`, maxHeight: `3508px`, mx: `auto`, overflow: `hidden`}}>
            {onProcess? <LinearProgress />: <></>}
            {success? <Alert sx={{width: `100%`}} severity="success">{message}</Alert>: <></>}
            {error? <Alert sx={{width: `100%`}} severity="error">{message}</Alert>: <></>}
            {data? data.approved? <Alert sx={{width: `100%`}} severity="success">Bi??n b???n ???? ???????c x??c nh???n b???i ch??? t???ch h???i ?????ng</Alert>: 
            <Alert sx={{width: `100%`}} severity="warning">{data.isSubmitted? "Bi??n b???n ??ang ch??? x??c nh???n t??? ch??? t???ch h???i ?????ng" : "Bi??n b???n ch??a ???????c x??c nh???n b???i ch??? t???ch h???i ?????ng"}</Alert>: <></>}
            <Grid container sx={{width: `100%`}} >
                <Grid xs={6}>
                <Stack direction={"column"} sx={{width: `100%`}} alignItems={"center"}>
                    <Typography sx={{fontSize: `13pt`}}>TR?????NG ?????I H???C C???N TH??</Typography>
                    <Typography sx={{fontSize: `13pt`, fontWeight: `bold`, textDecoration: `underline`}}>KHOA CNTT & TRUY???N TH??NG</Typography>
                </Stack>
                </Grid>
                <Grid xs={6}>
                    <Stack direction={"column"} sx={{width: `100%`}} alignItems={"center"}>
                        <Typography sx={{fontSize: `13pt`, fontWeight: `bold`}}>C???NG H??A X?? H???I CH??? NGH??A VI???T NAM</Typography>
                        <Typography sx={{fontSize: `13pt`, fontWeight: `bold`, textDecoration: `underline`}}>?????c l???p - T??? do - H???nh ph??c</Typography>
                    </Stack>
                </Grid>
            </Grid>
            <Stack direction="column" sx={{width: `100%`}} alignItems={"center"}>
                <Typography sx={{fontSize: `14pt`, fontWeight: `bold`}}>BI??N B???N C???A H???I ?????NG</Typography>
                <Typography sx={{fontSize: `14pt`, fontWeight: `bold`}}>CH???M BA??O V???? LU???N V??N ?????I H???C</Typography>
                <Typography sx={{fontSize: `14pt`, fontWeight: `bold`}}>H???c k???:   
                <span sx={{width: `80px`, textAlign: `center`}}> {thesisData? thesisData.semester.semesterCode == "1"? "I": "II": ""}</span>    n??m h???c   
                <span sx={{width: `80px`, textAlign: `center`}}> {thesisData? thesisData.semester.startYear + " - " + thesisData.semester.endYear: ""}</span> </Typography>
            </Stack>
            <Typography sx={{fontSize: `13pt`, fontWeight: `bold`, textAlign: "center"}}>Ng??nh: K??? THU???T PH???N M???M</Typography>
            <Stack direction={"column"} sx={{width: `100%`, marginTop: `20px`}}>
                <Typography sx={{fontSize: `13pt`}}>H??? t??n sinh vi??n: {thesisData? thesisData.student.name: ""}</Typography>
                <Grid container sx={{width: `100%`}}>
                    <Grid xs={6}>
                        <Typography>MSSV: {thesisData? thesisData.student.studentCode: ""}</Typography>
                    </Grid>
                    <Grid xs={6}>
                        <Typography>M?? l???p: {thesisData? thesisData.student.classCode: ""} </Typography>
                    </Grid>
                </Grid>
                <Typography>Gi??o vi??n h?????ng d???n: {thesisData? thesisData.lecturer.name: ""}</Typography>
                <Typography>T??n ????? t??i: {thesisData? thesisData.topic.name: ""}</Typography>
                <Typography>?????a ??i???m b???o v???: {thesisData?"Ph??ng " + thesisData.place: ""}</Typography>
                <Stack direction="row" gap={2} sx={{width: `100%`}}>
                    <Typography>Th???i gian l??c:  {thesisData? thesisData.time: ""}</Typography>
                    <Typography>ng??y  {thesisData? thesisData.dateArr[0]:""}</Typography>
                    <Typography>th??ng  {thesisData? thesisData.dateArr[1]:""}</Typography>
                    <Typography>n??m  {thesisData? thesisData.dateArr[2]:""}</Typography>
                </Stack>
            </Stack>
            <Stack direction="column" gap={1} sx={{width: `100%`}}>
                <Typography sx={{fontWeight: `bold`}}>1. Tuy??n b??? l?? do:</Typography>
                <Typography> <input type="text" style={{width: `30px`, visibility: `hidden`}}></input>
                Ca??n c???? va??o Quy????t ??i??nh s???? <input type="text" value={otherThing[0]} onChange={e => onOtherChange(e.target.value, 0)} style={{textAlign: `center` ,width: `30px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input> /Q??-CNTT&TT nga??y
                <input type="text" value={otherThing[1]} onChange={e => onOtherChange(e.target.value, 1)} style={{textAlign: `center` ,width: `30px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input> 
                 /<input type="text" value={otherThing[2]} onChange={e => onOtherChange(e.target.value, 2)} style={{textAlign: `center` ,width: `30px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input> 
                 /<input type="text" value={otherThing[3]} onChange={e => onOtherChange(e.target.value, 3)} style={{textAlign: `center` ,width: `50px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input> 
                 cu??a Tr?????ng khoa 
                CNTT&TT, tr?????ng ?????i h???c C???n Th?? v???? vi???c tha??nh l???p H???i ??????ng ch????m Lu???n va??n t???t nghi???p
                ng??nh/ chuy??n ng??nh K??? thu???t ph???n m???m . g???m c??c th??nh vi??n:
                </Typography>
                <Grid container sx={{width: `100%`, margin: ` 20px 10px 20px 10px`}}>
                    <Grid xs={4}><Typography>1. {thesisData? thesisData.president.title + ". " +  thesisData.president.name: ""}</Typography></Grid>
                    <Grid xs={5}><Typography>ch??? t???ch H???i ?????ng </Typography></Grid>
                    <Grid xs={4}><Typography>2. {thesisData? thesisData.secretary.title + ". " +  thesisData.secretary.name: ""}</Typography></Grid>
                    <Grid xs={5}><Typography>th?? k?? </Typography></Grid>
                    <Grid xs={4}><Typography>3. {thesisData? thesisData.member.title + ". " +  thesisData.member.name: ""}</Typography></Grid>
                    <Grid xs={5}><Typography>u??? vi??n </Typography></Grid> 
                </Grid>
                <Typography sx={{fontWeight: `bold`}}>2. Ch??? t???ch H???i ?????ng, ??i???u khi???n bu???i b???o v??? lu???n v??n</Typography>
                <Typography><span style={{fontWeight: `bold`}}>2.1 Sinh vi??n:</span> tr??nh b??y lu???n v??n</Typography>
                <Typography sx={{fontWeight: `bold`}}>2.2 Ca??c c??u h???i c???a th??nh vi??n h???i ?????ng v?? tr??? l???i c???a sinh vi??n:</Typography>
                <TextField color="secondary" value={qna} onChange={e => setQna(e.target.value)} multiline fullWidth variant="standard"/>
                <Typography sx={{fontWeight: `bold`}}>2.3. G??p ?? c???a th??nh vi??n trong h???i ?????ng:</Typography>
                <TextField color="secondary" value={advices} onChange={e => setAdvices(e.target.value)} multiline fullWidth variant="standard"/>
                <Typography sx={{fontWeight: `bold`}}>2.4. ?? ki????n nh???n x??t cu??a ng??????i h??????ng d????n:</Typography>
                <TextField color="secondary" value={comment} onChange={e => setComment(e.target.value)} multiline fullWidth variant="standard"/>
                <Typography sx={{fontWeight: `bold`}}>2.5. T???ng h???p ??i???m c???a H????i ??????ng:</Typography>
                <Stack direction="column" gap={2} sx={{width: `100%`, marginLeft: `20px`, marginTop: `10px`}}  >
                    <Typography>??i???m s???:</Typography>
                    <Stack sx={{width: `100%`}} alignItems={"center"}>
                        <TableContainer sx={{marginLeft: `calc(100% - 400px)`}}>
                        <Table sx={{ width: 400 }}>
                            <TableHead>
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 1 } }}>
                                <TableCell align="center">Th??nh vi??n</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="center">2</TableCell>
                                <TableCell align="center">3</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow
                                sx={{ '&:last-child td, &:last-child th': { border: 1 } }}
                                >
                                <TableCell align="center">??i???m/10</TableCell>
                                <TableCell align="center">{presidentPoint}</TableCell>
                                <TableCell align="center">{memberPoint}</TableCell>
                                <TableCell align="center">{secretaryPoint}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        </TableContainer>
                    </Stack>
                </Stack>
                <Typography>
                    Trung b??nh: ??i???m s??? {totalPoint}/10, 
                    ??i???m ch???: {convertNumberMarkToLetterMark(totalPoint)}
                    </Typography>
                <Typography sx={{fontWeight: `bold`}}>2.6. K???t lu???n c???a H????i ??????ng:</Typography>
                <Stack direction="row">
                <Typography sx={{paddingLeft: `20px`}}>Lu???n v??n c???a sinh vi??n {thesisData? thesisData.student.name: ""} . </Typography>
                <TextField component={'span'} variant="standard" sx={{width: `100px`, textAlign: `center`}} value={presentationResult} onChange={e => setPresentationResult(e.target.value)} select>
                    <MenuItem component={'span'} value={"?????t"}>?????t</MenuItem>
                    <MenuItem component={'span'} value={"kh??ng ?????t"}>kh??ng ?????t</MenuItem>
                </TextField>
                <Typography> y??u c???u.
                </Typography>
                </Stack>
                <Typography sx={{paddingLeft: `20px`}}>??i???m: {totalPoint}</Typography>
                <Typography sx={{marginTop: `30px`}}>H???i ?????ng k???t th??c v??o l??c <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} style={{textAlign: `center` ,width: `200px`, border: `none`, outline: `none`, borderBottom: `1px dashed black`, fontSize: `13pt`}}></input>c??ng ng??y.</Typography>
                <Grid container sx={{width: `100%`, marginTop: `30px`}}>
                    <Grid xs={5}>
                        <Stack direction="column" alignItems={"center"} sx={{width: `100%`}}>
                        <Typography sx={{visibility: `hidden`}}>Ch??? t???ch h???i ?????ng</Typography>
                        <Typography>Ch??? t???ch h???i ?????ng</Typography>
                        <Typography sx={{textAlign: `center` , marginTop: `70px`,width: `200px`, border: `none`, outline: `none`, fontSize: `13pt`}}>{thesisData? thesisData.president.name: ""}</Typography>
                        </Stack>
                    </Grid>
                    <Grid xs={7}>
                        <Stack direction="column" alignItems={"center"} sx={{width: `100%`}}>
                        <Typography><i>C???n Th??, ng??y  {thesisData? thesisData.dateArr[0]:""} th??ng  {thesisData? thesisData.dateArr[1]:""} n??m  {thesisData? thesisData.dateArr[2]:""}</i></Typography>
                        <Typography>Th?? k?? h???i ?????ng</Typography>
                        <Typography sx={{textAlign: `center` , marginTop: `70px`,width: `200px`, border: `none`, outline: `none`, fontSize: `13pt`}}>{thesisData? thesisData.secretary.name: ""}</Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
            {!thesisData.approved?<SpeedDial
                ariaLabel="SpeedDial"
                sx={{ position: 'fixed', bottom: `5%`, right: `3%` }}
                icon={<SpeedDialIcon />}
                open={open}
                onOpen={e => setOpen(true)}
                onClose={e => setOpen(false)}
                hidden={data && data.approved}
            >
                {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={e => {action.onClick(); setOpen(false)}}
                />
                ))}
            </SpeedDial>:<></>}
        </Stack>
    )
}

export default Report;