/**
 * Source for the Meeting component. This component consists mostly of
 * a very large meeting form, which is used to create/edit meetings.
 */
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {
  React,
  useState,
  useRef,
  useEffect
} from 'react';
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  Button
} from 'reactstrap';
import { useNavigate, useLocation } from "react-router-dom";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import ExposureOutlinedIcon from "@mui/icons-material/ExposureOutlined";
import {
  meeting_create,
  meeting_ocr,
  meeting_update,
  person_view,
  tasks_create,
  tasks_view
} from '../../../api';
import AppSidebar from "../../../components/appSidebar";
import InvitePeopleModal from "../../../components/modals/InvitePeopleModal.js";

const Meeting = (props) => {
  const [taskDropdownOptions,setTaskDropdownOptions] = useState(['other']);
  const [selectedTaskDropdownOption,setSelectedTaskDropdownOption] = useState([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [agenda, setAgenda] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  // attendeeIds is a list of person ids
  const [attendeeIds, setAttendeeIds] = useState([]);
  // attendees is a list of person objects
  const [attendees, setAttendees] = useState([]);
  const [teams, setTeams] = useState("");
  const [notes, setNotes] = useState("");
  const [meetingTasks, setMeetingTasks] = useState([]);
  // imageSrc contains image data to be processed and sent
  // with meeting_ocr request.
  const [imageSrc, setImageSrc] = useState("");
  // crop is an object used in cropping image.
  const [crop, setCrop] = useState({
    unit: "%", // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50
  });
  /*
   * "First" scan state means ready to select an image. When not in
   * first scanstate, we are in "second" scan state, meaning ready to
   * either send OCR request or cancel (go back to first state).
   */
  const [isInFirstScanState, setIsInFirstScanState] = useState(true);
  /*
   * Arrays typeSync and typeStrings for synchronizing type state with form.
   */
  const [typeSync, setTypeSync] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ]);
  const [tasks, setTasks] = useState([]);
  const [typeStrings, setTypeStrings] = useState([
    "1 on 1",
    "Delegation",
    "Leadership Pipeline",
    "Personal Growth",
    "Debrief",
    "Goal Setting",
    "Leadership Workshop",
    "Problem Solving"
  ]);
  // people holds all person objects
  const [people, setPeople] = useState([]);
  const [isInvitePeopleModalOpen, setIsInvitePeopleModalOpen] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  // imageRef allows component to keep a reference to
  // the image element in the DOM (used in cropping)
  const imageRef = useRef(null);

  useEffect(() => {
        tasks_view()
            .then((req) => {
                const task = req.data.results;
                setTasks(task);
                let taskObj=taskDropdownOptions.slice();
                  task.forEach(x => {
                    taskObj.push(x.task_name);
                  });
                setTaskDropdownOptions(taskObj);
            })
            .catch((error) => {
                console.log(error);
            });
            
            
      
             
}, []);
  useEffect(() => {
   
    
    if (state.clearForm) {
      setId('');
      handleClearForm();
    } else {
      setId(state.meeting.id);
      setName(state.meeting.name);
      setAgenda(state.meeting.agenda);
      setDate(state.meeting.date);
      setTime(state.meeting.time);
      setType(state.meeting.type);
      const updatedTypeSync = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ];
      updatedTypeSync[typeStrings.indexOf(state.meeting.type)] = true;
      setTypeSync(updatedTypeSync);
      setNotes(state.meeting.notes);
      setAttendeeIds(state.meeting.attendees);
      const attendeesArray = [];
      const attendeeIdsArray = [];
      let persons = [];
      // fetch all meetings then push those who are attendees
      // of this meeting to attendeesArray
      person_view()
        .then((res) => {
          persons = res.data;
        })
        .then(() => {
          for (const person of persons) {
            if (state.meeting.attendees.indexOf(person.id) > -1) {
              attendeesArray.push(person);
              attendeeIdsArray.push(person.id);
            }
          }
        })
        .then(() => {
          setAttendees(attendeesArray);
          setAttendeeIds(attendeeIdsArray);
        })
        .catch((error) => {
          console.log(error);
        });
      const meetingTasksArray = [];
      let tasks = [];
      // fetch all tasks then push those which belong to this
      // meeting to meetingTasksArray
      tasks_view()
        .then((res) => {
          tasks = res.data.results;
        })
        .then(() => {
          for (const task of tasks) {
            if (state.meeting.meeting_tasks.indexOf(task.task_id) > -1) {
              meetingTasksArray.push(task);
            }
          }
        })
        .then(() => {
          setMeetingTasks(meetingTasksArray);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [state]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleAgendaChange = (e) => setAgenda(e.target.value);
  const handleDateChange = (e) => setDate(e.target.value);
  const handleTimeChange = (e) => setTime(e.target.value);
  const handleTypeChange = (e) => {
    const value = e.target.value;
    const updatedTypeSync = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ];

    updatedTypeSync[value] = true;
    setTypeSync(updatedTypeSync);
    setType(typeStrings[value]);
  }
  const handleTeamsChange = (e) => setTeams(e.target.value);
  const handleNotesChange = (e) => setNotes(e.target.value);
  const handleMeetingTasksChange = (e) => {
    const meetingTaskIndex = Number(e.target.getAttribute("index"));
    const updatedMeetingTasks = meetingTasks.map(
      meetingTask => {
        if (meetingTasks.indexOf(meetingTask) !== meetingTaskIndex) {
          return meetingTask;
        } else {
          return {
            ...meetingTask,
            [e.target.getAttribute("name")]: e.target.value
          };
        }
      }
    );
    setMeetingTasks(updatedMeetingTasks);
  }

  function showError(elementId, errorMessage) {
    const errorElement = document.getElementById(elementId);
    errorElement.innerText = errorMessage;
    errorElement.style.display = 'block';
  }

  const OnTaskOptionChange=(dropdownValue,dropDownSelectedIndex,taskIndex)=>{
    console.log(dropdownValue)
    if(dropdownValue.value!='other'){
      let substituteMeetingTasks=meetingTasks.slice();
      const meetingTask = {
      task_name: tasks[dropDownSelectedIndex-1].task_name,
      employee_name: tasks[dropDownSelectedIndex-1].employee_name,
      start_date: tasks[dropDownSelectedIndex-1].start_date,
      end_date: tasks[dropDownSelectedIndex-1].end_date,
      task_description: tasks[dropDownSelectedIndex-1].task_description,
      priority: tasks[dropDownSelectedIndex-1].priority,
      meeting_id: tasks[dropDownSelectedIndex-1].meeting_id,
    }
    substituteMeetingTasks[taskIndex]=meetingTask;
    setMeetingTasks(substituteMeetingTasks)
    

    let updatedselectedTaskDropdownOption=selectedTaskDropdownOption.slice();
    updatedselectedTaskDropdownOption[taskIndex]=dropdownValue;
    setSelectedTaskDropdownOption(updatedselectedTaskDropdownOption);

    }
    else{

      let substituteMeetingTasks=meetingTasks.slice();
      const meetingTask = {
        task_name: "",
        employee_name: "",
        start_date: "1970-01-01",
        end_date: "",
        task_description: "",
        priority: "",
        meeting_id: "1",
    }
    substituteMeetingTasks[taskIndex]=meetingTask;
    
    setMeetingTasks(substituteMeetingTasks);
    let updatedselectedTaskDropdownOption=selectedTaskDropdownOption.slice();
    updatedselectedTaskDropdownOption[taskIndex]=dropdownValue.value;
    setSelectedTaskDropdownOption(updatedselectedTaskDropdownOption);
    }

  }
  
  

  // Send the form data to the API using fetch or axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    var anyError = false;
    const errorFields = document.querySelectorAll('.error-message');
    errorFields.forEach(field => field.innerText = '');

    if (!name) {
        showError('nameError', 'Name field is required.');
        anyError = true;
    }
    if (!type) {
        showError('typeError', 'Type field is required.');
        anyError = true;
    }
    if (!date) {
      showError('dateError', 'Date field is required.');
      anyError = true;
    }
  if (!time) {
    showError('timeError', 'Time field is required.');
    anyError = true;
    }
  if (!agenda) {
    showError('agendaError', 'Agenda field is required.');
    anyError = true;
    }
  if (!notes) {
      showError('noteError', 'Meeting Notes field is required.');
      anyError = true;
      }
  if(anyError) {
        alert("Required fields are missing! Please check and try again!");
        return;
      }

    const meeting = {
      name: name,
      type: type,
      date: date,
      time: time,
      attendees: attendeeIds,
      agenda: agenda,
      notes: notes,
      meeting_tasks: []
    };

    const submitMeeting = () => {
      if (id === "") {
        meeting_create(meeting)
          .then(() => {
            navigate("/schedule");
          })
          .catch((error) => {
            console.error("Error creating meeting:", error);
          });
      } else {
        meeting_update(state.meeting.id, meeting)
          .then(() => {
            navigate("/schedule");
          })
          .catch((error) => {
            console.error("Error updating meeting:", error);
          })
      }
    }

    let counter = meetingTasks.length;

    const checkSubmitMeeting = () => {
      if (--counter <= 0) {
        submitMeeting();
      }
    }

    if (counter === 0) {
      submitMeeting();
    }

    

    meetingTasks.forEach((meetingTask, index) => {
      if(selectedTaskDropdownOption[index]=='other'){
      tasks_create(meetingTask)
        .then((res) => {
          meeting.meeting_tasks.push(res.data.task_id);
        })
        .then(() => {
          checkSubmitMeeting();
        })
        .catch((error) => {
          console.error(`Error creating task at index ${index}:`, error);
        });
      } else{
        checkSubmitMeeting();
      }
    });

  };



  const handleClearForm = () => {
    setName("");
    setAgenda("");
    setDate("");
    setTime("");
    setType("");
    setTypeSync([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
    setAttendeeIds([]);
    setAttendees([]);
    setTeams("");
    setNotes("");
    setMeetingTasks([]);
  };

  const addMeetingTask = () => {
    const meetingTask = {
      task_name: "",
      employee_name: "",
      start_date: "1970-01-01",
      end_date: "",
      task_description: "",
      priority: "",
      meeting_id: "1",
    }

    let updatedMeetingTasks = meetingTasks.slice();
    updatedMeetingTasks.push(meetingTask);
    setMeetingTasks(updatedMeetingTasks);
    let updatedselectedTaskDropdownOption= selectedTaskDropdownOption.slice();
    updatedselectedTaskDropdownOption.push(taskDropdownOptions[0]);
    setSelectedTaskDropdownOption(updatedselectedTaskDropdownOption);
  }

  const removeMeetingTask = (e) => {
    const meetingTaskIndex = meetingTasks.indexOf(e.target.getAttribute("task"));
    const updatedMeetingTasks = [...meetingTasks];
    updatedMeetingTasks.splice(meetingTaskIndex, 1);
    setMeetingTasks(updatedMeetingTasks);
  }

  const toggleInvitePeopleModal = () => {
    setIsInvitePeopleModalOpen(!isInvitePeopleModalOpen);
  }

  const fetchPeopleAndToggleModal = async () => {
    const response =
      await person_view()
      .then((res) => {
        setPeople(res.data);
      })
      .then(() => {
        toggleInvitePeopleModal();
      })
      .catch((error) => {
        console.log(error)
      });
  }

  /*
   * Closure to pass to InvitePeopleModal and
   * from there to NameCard.
   */
  const invitePerson = (person) => {
    if (!attendeeIds.includes(person.id)) {
      const updatedAttendeeIds = [...attendeeIds];
      const updatedAttendees = [...attendees];
      updatedAttendeeIds.push(person.id);
      updatedAttendees.push(person);
      setAttendeeIds(updatedAttendeeIds);
      setAttendees(updatedAttendees);
    }
  }

  /*
   * Closure to pass to InvitePeopleModal and
   * from there to NameCard.
   */
  const uninvitePerson = (person) => {
    if (attendeeIds.includes(person.id)) {
      const updatedAttendeeIds = [...attendeeIds];
      const updatedAttendees = [...attendees];
      const index = updatedAttendeeIds.indexOf(person.id);
      updatedAttendeeIds.splice(index, 1);
      updatedAttendees.splice(index, 1);
      setAttendeeIds(updatedAttendeeIds);
      setAttendees(updatedAttendees);
    }
  }

  /*
   * Load a different local file for OCR.
   */
  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  const handleScanFromPhotoClick = async () => {
    imageRef.current.click();
    toggleScanState();
  }

  /*
   * Get binary array representation of cropped image then
   * send POST request to meeting view that makes call to
   * OCR api. Currently logs response text in console.
   */
  const handleOCRRequest = () => {
    const imgElem = document.getElementById("img-elem")
    const croppedImageCanvas = document.createElement("canvas");
    croppedImageCanvas.width = 0.01 * crop.width * imgElem.naturalWidth;
    croppedImageCanvas.height = 0.01 * crop.height * imgElem.naturalHeight;
    const croppedImageContext = croppedImageCanvas.getContext("2d");

    croppedImageContext.drawImage(
      imgElem,
      0.01 * crop.x * imgElem.naturalWidth,
      0.01 * crop.y * imgElem.naturalHeight,
      0.01 * crop.width * imgElem.naturalWidth,
      0.01 * crop.height * imgElem.naturalHeight,
      0,
      0,
      0.01 * crop.width * imgElem.naturalWidth,
      0.01 * crop.height * imgElem.naturalHeight,
    );

    const croppedImage = new Promise(
      (resolve, reject) => {
        croppedImageCanvas.toBlob(
          blob => {resolve(blob);},
          "image/jpeg"
        );
      }
    );

    const reader = new FileReader();
    reader.onload = async () => {
      const response = await meeting_ocr({image_binary : new Uint8Array(reader.result)})
        .catch((error) => {
          console.log(error);
        });
      console.log(response.data);
      setName(response.data.name_date);
      setAgenda(response.data.agenda);
      setNotes(
        response.data.questions.concat(
          "\n",
          response.data.objective,
          "\n",
          response.data.notes,
          "\n",
          response.data.action_steps
        )
      );
    }
    croppedImage.then(res => reader.readAsArrayBuffer(res));
    toggleScanState();
  }

  /*
   * In first scan state (isInFirstScanState is true), display
   * "Scan Meeting From Photo" button. In second scan state
   * (isInFirstScanState is false), show "Process Image" and
   * "Cancel" buttongs.
   */
  const toggleScanState = () => {
    setIsInFirstScanState(!isInFirstScanState);
  }

  return (
    <div style={{display: "flex"}}>
      <AppSidebar />
      <InvitePeopleModal
        isOpen={isInvitePeopleModalOpen}
        toggle={toggleInvitePeopleModal}
        people={people}
        attendeeIds={attendeeIds}
        invite={invitePerson}
        uninvite={uninvitePerson}
      />
      <Container className="layout-container">
        <Card className="outer-card">
          <CardBody>
            <Card style={{maxWidth: "70%", position: "relative", left: "15%"}} className="my-card">
              <CardBody className="my-card-body">
                <Row style={{width: "50%", position: "relative", left: "25%", textAlign: "center"}}>
                  <input type="file" hidden ref={imageRef} onChange={onImageChange} />
                  {
                    isInFirstScanState ?
                      <div>
                        <Card className="outer-card">
                          <CardBody>
                            <Button
                              color="success"
                              onClick={handleScanFromPhotoClick}
                            >
                              Scan From Image
                            </Button>
                          </CardBody>
                        </Card>
                      </div>
                      :
                      <div>
                        {!!imageSrc && (
                          <ReactCrop crop={crop} onChange={(crop, percentCrop) => setCrop(percentCrop)}>
                            <img id="img-elem" src={imageSrc} alt="Crop me." />
                          </ReactCrop>
                        )}
                        <Card className="outer-card">
                          <CardBody>
                            <Button
                              className="my-button"
                              color="success"
                              onClick={handleOCRRequest}
                            >
                              Process Image
                            </Button>{" "}
                            <Button
                              className="my-button"
                              color="success"
                              onClick={toggleScanState}
                            >
                              Cancel
                            </Button>
                          </CardBody>
                        </Card>
                      </div>
                  }
                </Row>
              </CardBody>
            </Card>
            <Form>
              <Card className="my-card">
                <CardBody className="my-card-body">
                  <Row xs={1} sm={1} md={2} lg={2}>
                    <Col>
                      <FormGroup>
                        <Label className="form-label" for="name">Meeting Name*</Label>
                        <Input className="form-input" type="text" name="name" id="name" value={name} onChange={handleNameChange} required />
                        <div id="nameError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="agenda">Agenda*</Label>
                        <Input className="form-input" type="textarea" name="agenda" id="agenda" value={agenda} onChange={handleAgendaChange} required />
                        <div id="agendaError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="date">Date*</Label>
                        <Input className="form-input" type="date" name="date" id="date" value={date} onChange={handleDateChange} required />
                        <div id="dateError" class="error-message"></div>
                      </FormGroup>
                      <FormGroup>
                        <Label className="form-label" for="time">Time*</Label>
                        <Input className="form-input" type="time" name="time" id="time" value={time} onChange={handleTimeChange} required />
                        <div id="timeError" class="error-message"></div>
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label className="form-label" for="type">Meeting Type*</Label>
                        <Card className="my-card my-border">
                          <CardBody>
                            <Row>
                              <Col>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={0}
                                      checked={typeSync[0]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    1 on 1
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={1}
                                      checked={typeSync[1]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Delegation
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={2}
                                      checked={typeSync[2]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Leadership Pipeline
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={3}
                                      checked={typeSync[3]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Personal Growth
                                  </Label>
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={4}
                                      checked={typeSync[4]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Debrief
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={5} checked={typeSync[5]} onChange={handleTypeChange}
                                    />{' '}
                                    Goal Setting
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={6}
                                      checked={typeSync[6]}
                                      onChange={handleTypeChange}
                                    />{' '}
                                    Leadership Workshop
                                  </Label>
                                </FormGroup>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      className="my-border"
                                      type="radio"
                                      name="type"
                                      id="type-radio"
                                      value={7}
                                      checked={typeSync[7]}
                                      onChange={handleTypeChange} />{' '}
                                    Problem Solving
                                  </Label>
                                </FormGroup>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                        <div id="typeError" class="error-message"></div>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <Card className="my-card">
                <CardBody className="my-card-body">
                  <Row>
                    <FormGroup>
                      <Label className="form-label" for="attendees">Invite People</Label>
                      <Row>
                        <div style={{maxWidth: "3%"}}>
                          <IconButton>
                            <ExposureOutlinedIcon onClick={fetchPeopleAndToggleModal} />
                          </IconButton>
                        </div>
                        {
                          attendees.map(
                            (person) => (
                              <Card
                                key={person.id}
                                style={{
                                  textAlign: "center",
                                  justifyContent: "center",
                                  width: "20%",
                                  marginLeft: "5%",
                                  backgroundColor: "rgba(200, 250, 200, 0.5)",
                                  borderColor: "green"
                                }}
                              >
                                {person.name}
                              </Card>
                            )
                          )
                        }
                      </Row>
                    </FormGroup>
                  </Row>
                </CardBody>
              </Card>
              <Card className="my-card">
                <CardBody className="my-card-body">
                  <Row>
                    <FormGroup style={{width: "50%", position: "relative", left: "25%"}}>
                      <Label className="form-label" for="notes">Meeting Notes*</Label>
                      <Input className="form-input" type="textarea" name="notes" id="notes" value={notes} onChange={handleNotesChange} />
                      <div id="noteError" class="error-message"></div>
                    </FormGroup>
                  </Row>
                </CardBody>
              </Card>
              <Card className="my-card">
                <CardBody className="my-card-body">
                  <Row>
                    <FormGroup>
                      <Label className="form-label" for="tasks">Tasks</Label>
                    </FormGroup>
                  </Row>
                  <Row>
                  <Col style={{maxWidth: "5%"}}>
                      {
                        meetingTasks.map(
                          (task) => (
                            <Row className="form-task-row">
                              <div>
                                <IconButton>
                                  <RemoveCircleOutlineOutlinedIcon task={task} index={meetingTasks.indexOf(task)} onClick={removeMeetingTask} />
                                </IconButton>
                              </div>
                            </Row>
                          )
                        )
                      }
                    </Col>
                  <Col >
                      {
                        meetingTasks.map(
                          (task,index) => (
                            <Row className="form-task-row">
                                <div>
                                <Dropdown
                                className="custom-dropdown" 
                                 onChange={
                                  (selectedValue) => {
                                    const selectedIndex = taskDropdownOptions.findIndex(option => option === selectedValue.value);
                                    OnTaskOptionChange(selectedValue, selectedIndex,index)
                                  }}
                                   options={taskDropdownOptions} 
                                   value={selectedTaskDropdownOption[index]} 
                                   placeholder="Select an option" />
                                </div>
                            </Row>
                          )
                        )
                      }
                    </Col>
                    
                    <Col>
                      {
                        meetingTasks.map(
                          (task,index) => (
                            <Row className="form-task-row">
                              <FormGroup>
                                <Input
                                  className="form-input"
                                  type="text"
                                  name="task_name"
                                  placeholder="Task Name"
                                  index={meetingTasks.indexOf(task)}
                                  value={task.task_name}
                                  onChange={handleMeetingTasksChange}
                                  readOnly={selectedTaskDropdownOption[index]!='other'? true : false}
                                />
                              </FormGroup>
                            </Row>
                          )
                        )
                      }
                    </Col>
                    <Col>
                      {
                        meetingTasks.map(
                          (task,index) => (
                            <Row className="form-task-row">
                              <FormGroup>

                                <Input
                                  className="form-input"
                                  type="date"
                                  name="end_date"
                                  index={meetingTasks.indexOf(task)}
                                  value={task.end_date}
                                  onChange={handleMeetingTasksChange}
                                  readOnly={selectedTaskDropdownOption[index]!='other'? true : false}
                                />
                                {
                                  meetingTasks.indexOf(task) === meetingTasks.length - 1 ?
                                    (
                                      <FormText>
                                        Due Date
                                      </FormText>
                                    ) :
                                    (
                                      <div />
                                    )
                                }
                              </FormGroup>
                            </Row>
                          )
                        )
                      }
                    </Col>
                    <Col>
                      {
                        meetingTasks.map(
                          (task,index) => (
                            <Row className="form-task-row">
                              <FormGroup>
                                <Input
                                  className="form-input"
                                  type="text"
                                  name="employee_name"
                                  placeholder="Assign To"
                                  index={meetingTasks.indexOf(task)}
                                  value={task.employee_name}
                                  onChange={handleMeetingTasksChange}
                                  readOnly={selectedTaskDropdownOption[index]!='other'? true : false}
                                />
                              </FormGroup>
                            </Row>
                          )
                        )
                      }
                    </Col>
                    <Col>
                      {
                        meetingTasks.map(
                          (task,index) => (
                            <Row className="form-task-row">
                              <FormGroup>
                                <Input
                                  className="form-input"
                                  type="text"
                                  name="priority"
                                  placeholder="Priority"
                                  index={meetingTasks.indexOf(task)}
                                  value={task.priority}
                                  onChange={handleMeetingTasksChange}
                                  readOnly={selectedTaskDropdownOption[index]!='other'? true : false}
                                />
                              </FormGroup>
                            </Row>
                          )
                        )
                      }
                    </Col>
                    <Col>
                      {
                        meetingTasks.map(
                          (task,index) => (
                            <Row className="form-task-row">
                              <FormGroup>
                                <Input
                                  className="form-input"
                                  type="text"
                                  name="task_description"
                                  placeholder="Details"
                                  index={meetingTasks.indexOf(task)}
                                  value={task.task_description}
                                  onChange={handleMeetingTasksChange}
                                  readOnly={selectedTaskDropdownOption[index]!='other'? true : false}
                                />
                              </FormGroup>
                            </Row>
                          )
                        )
                      }
                    </Col>
                  </Row>
                  <Row>
                    <div>
                      <IconButton>
                        <AddCircleOutlineOutlinedIcon onClick={addMeetingTask} />
                      </IconButton>
                    </div>
                  </Row>
                </CardBody>
              </Card>
            </Form>
            <Card style={{maxWidth: "70%", position: "relative", left: "15%"}} className="my-card">
              <CardBody className="my-card-body">
                <Row style={{width: "50%", position: "relative", left: "25%", textAlign: "center"}}>
                  <div>
                    <Card className="outer-card">
                      <CardBody>
                        <Button
                          className="my-button"
                          color="success"
                          type="submit"
                          onClick={handleSubmit}
                        >
                          Save
                        </Button>{" "}
                        <Button
                          className="my-button"
                          color="success"
                          onClick={handleClearForm}
                        >
                          Clear
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                </Row>
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Meeting;