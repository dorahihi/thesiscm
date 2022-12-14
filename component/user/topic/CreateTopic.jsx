import { Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, LinearProgress, ListItemText, MenuItem, OutlinedInput, Select, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { sendAuthGetRequest, sendAuthPostResquest, sendPostRequest } from "../../../common/utils";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateTopic = ({open, setOpen}) => {
    const account = useSelector(state => state.user.account);
    const [onProcess, setOnProcess] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [students, setStudents] = useState({});

    const [viName, setViName] = useState("");
    const [enName, setEnName] = useState("");
    const [type, setType] = useState("2");
    const [studentArr, setStudentArr] = useState([]);
    const [student, setStudent] = useState("");
    const [viNameValid, setViNameValid] = useState(true);
    const [enNameValid, setEnNameValid] = useState(true);

    useEffect(() => {
        getStudents();
    },[]);

    useEffect(() => {
      console.log(type);
    }, [type])

    const onClose =() =>{
        reset();
        setOpen(false);
    }

    const reset = () => {
      setOnProcess(false);
      setMessage("");
      setIsError(false);
      setIsSuccess(false);
      setStudent({});
      setViName("");
      setEnName("");
      setType("1");
      setStudentArr([]);
      setStudent("");
      setViNameValid(true);
      setEnNameValid(true);
    }

    const onSubmit = async () =>{
      setOnProcess(true);
      if(validate()){
        let data = new FormData();
        data.append("type", type);
        data.append("name", viName);
        data.append("enName", enName);
        if(type == "1"){
          data.append("member", student);
        } else {
          data.append("member", studentArr.join(","));
        }
        data.append( "account", account);

        let result = await sendAuthPostResquest("/api/topic", data);
        if(result.status === 200) {
          if(!result.data) {
            setIsSuccess(false);
            setIsError(true);
            setMessage("Sinh vi??n ???? c?? nh??m ????? t??i, vui l??ng ch???n l???i");
          } else {
            reset();
            setIsSuccess(true);
            setMessage("T???o ????? t??i lu???n v??n th??nh c??ng");
          }
        } else {
          setIsSuccess(false);
          setIsError(true);
          setMessage("???? c?? l???i x???y ra, vui l??ng th???c hi??n l???i");
        }
      } else {
        setOnProcess(false);
      }
    }

    const validate = () =>{
      let result = true;
      if(viName == ""){
        result = false;
        setViNameValid(false);
      }

      if(enName == "") {
        result = false;
        setEnNameValid(false);
      }

      if(type == "1" && student == ""){
        setIsError(true);
        setMessage("Vui l??ng ch???n m???t sinh vi??n ????? th???c hi???n ????? t??i");
        result = false;
      } else if(type == "2" && studentArr.length == 0){
        result = false;
        setIsError(true);
        setMessage("Vui l??ng ch???n ??t nh???t m???t sinh vi??n ????? th???c hi???n ????? t??i");
      }

      return result;
    }

    const onStudentChange = (event) => {
        const {
          target: { value },
        } = event;
        setStudentArr(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    const getStudents = async () => {
        let result = await sendAuthGetRequest("/api/student/current?account="+account);
        if(result.status === 200){
            let data = {};
            result.data.forEach(s => {
                data[s.studentCode + " - " + s.name] = s.id;   
               });
            setStudents(data);
        } 
    }

    return (
        <Dialog open={open} onClose={onClose}>
        <DialogTitle>T???o m???i ????? t??i lu???n v??n</DialogTitle>
        <DialogContent>
          {onProcess? <LinearProgress />: <></>}
          {isError? <Alert severity="error">{message}</Alert>: <></>}
          {isSuccess? <Alert severity="primary">{message}</Alert>: <></>}
          <Stack direction={"column"} sx={{gap: '20px'}}>
          <DialogContentText>
            T???o m???i m???t ????? t??i lu???n v??n cho m???t ho???c m???t nh??m sinh vi??n trong h???c k??? hi???n t???i
          </DialogContentText>
          <Stack gap={2} alignItems={"center"} direction={"column"} sx={{width: `100%`}} >
            <TextField fullWidth color="secondary" error={!viNameValid} required value={viName} onChange={(e) => (setViName(e.target.value))} label={"T??n ti???ng Vi???t"}
                        helperText={viNameValid? "" : "Gi?? tr??? kh??ng h???p l???"}/>
            <TextField fullWidth color="secondary" error={!enNameValid} required value={enName} onChange={(e) => (setEnName(e.target.value))} label={"T??n ti???ng Anh"}
                        helperText={viNameValid? "" : "Gi?? tr??? kh??ng h???p l???"}/>
            <TextField fullWidth color="secondary" required select={true}
                        value={type} onChange={(e) => {setType(e.target.value)}} label="Lo???i ????? t??i">
                        <MenuItem  key={"topic-type-individual"} value={"1"}>C?? nh??n</MenuItem >
                        <MenuItem  key={"topic-type-group"} value={"2"}>Nh??m</MenuItem >
            </TextField> 
            {type == "2"? <FormControl fullWidth>
                <InputLabel color="secondary" id="multiple-student-checkbox-label">Sinh vi??n th???c hi???n *</InputLabel>
                <Select
                    labelId="multiple-student-checkbox-label"
                    id="multiple-student-checkbox"
                    multiple
                    color="secondary"
                    fullWidth
                    value={studentArr}
                    input={<OutlinedInput label="Sinh vi??n th???c hi???n *" />}
                    onChange={onStudentChange}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    MenuProps={MenuProps}
                    >
                    {Object.keys(students).map((name) => (
                        <MenuItem  key={"individual_"+students[name]} value={name}>
                        <Checkbox checked={studentArr.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                        </MenuItem >
                    ))}
                    </Select>
            </FormControl> :
            <TextField fullWidth color="secondary" select={Object.keys(students).length > 0} required value={student} onChange={(e) => {setStudent(e.target.value)}} label="Sinh vi??n th???c hi???n">
                    {Object.keys(students).length > 0 ? Object.keys(students).map((name) => (
                        <MenuItem  key={"individual_"+students[name]} value={students[name]}>
                        {name}
                        </MenuItem >
                    )): <></>}
            </TextField>}
          </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="large" variant="outlined" color="secondary" onClick={onClose}>Hu???</Button>
          <Button size="large" variant="outlined" onClick={onSubmit}>L??u</Button>
        </DialogActions>
      </Dialog>
    )
}

export default CreateTopic;