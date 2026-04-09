// Component to create Firebase Auth accounts for faculty members
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase/FireBaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase/FireBaseConfig";
import { Button, Card, Container, Alert, Spinner, Form, ListGroup } from "react-bootstrap";

export default function CreateFacultyLogins() {
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [result, setResult] = useState(null);
  const [fetchingColleges, setFetchingColleges] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegesSnapshot = await getDocs(collection(db, "colleges"));
        const collegesData = collegesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setColleges(collegesData);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      } finally {
        setFetchingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  // Fetch faculty when college is selected
  useEffect(() => {
    if (selectedCollege) {
      const fetchFaculty = async () => {
        try {
          const facultySnapshot = await getDocs(collection(db, "users"));
          const facultyData = facultySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => user.role === "faculty" && user.collegeId === selectedCollege);
          setFaculty(facultyData);
        } catch (error) {
          console.error("Error fetching faculty:", error);
        }
      };

      fetchFaculty();
    } else {
      setFaculty([]);
    }
  }, [selectedCollege]);

  const handleFacultySelection = (facultyId) => {
    setSelectedFaculty(prev => 
      prev.includes(facultyId) 
        ? prev.filter(id => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFaculty.length === faculty.length) {
      setSelectedFaculty([]);
    } else {
      setSelectedFaculty(faculty.map(f => f.id));
    }
  };

  const handleCreateLogins = async () => {
    if (selectedFaculty.length === 0) {
      setResult({
        success: false,
        message: "Please select at least one faculty member"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let successCount = 0;
      const errors = [];
      const credentials = [];

      for (const facultyId of selectedFaculty) {
        const facultyMember = faculty.find(f => f.id === facultyId);
        if (!facultyMember) continue;

        try {
          // Create Firebase Auth account
          const email = `${facultyMember.name.toLowerCase().replace(/\s+/g, '.')}@bvcec.ac.in`;
          const password = "Faculty@1234";

          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update faculty document with Firebase Auth UID
          await updateDoc(doc(db, "users", facultyId), {
            uid: userCredential.user.uid,
            authEmail: email,
            hasAuthAccount: true,
            updatedAt: new Date()
          });

          credentials.push({
            name: facultyMember.name,
            email: email,
            password: password,
            department: facultyMember.department
          });

          successCount++;
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            errors.push(`${facultyMember.name}: Email already exists`);
          } else {
            errors.push(`${facultyMember.name}: ${error.message}`);
          }
        }
      }

      if (successCount > 0) {
        setResult({
          success: true,
          message: `Successfully created ${successCount} faculty login accounts!`,
          credentials: credentials,
          errors: errors.length > 0 ? errors : null
        });
      } else {
        setResult({
          success: false,
          message: "Failed to create any faculty login accounts",
          errors: errors
        });
      }

    } catch (error) {
      console.error("Error creating faculty logins:", error);
      setResult({
        success: false,
        error: error.message,
        message: "Failed to create faculty login accounts"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <Card className="shadow">
            <Card.Header className="bg-warning text-dark">
              <h4 className="mb-0">Create Faculty Login Accounts</h4>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Create Firebase Auth accounts for faculty members so they can login to the system.
              </p>
              
              {result && (
                <Alert variant={result.success ? "success" : "danger"} className="mb-4">
                  <Alert.Heading>
                    {result.success ? "Success!" : "Error!"}
                  </Alert.Heading>
                  <p className="mb-0">{result.message}</p>
                  {result.success && result.credentials && (
                    <div className="mt-3">
                      <strong>Faculty Login Credentials:</strong>
                      <ListGroup className="mt-2">
                        {result.credentials.map((cred, index) => (
                          <ListGroup.Item key={index}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{cred.name}</strong> ({cred.department})
                              </div>
                              <div className="text-end">
                                <small className="text-muted">{cred.email}</small><br/>
                                <small className="text-muted">Password: {cred.password}</small>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-3">
                      <strong>Errors:</strong>
                      <ul className="mb-0">
                        {result.errors.map((error, index) => (
                          <li key={index} className="small">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Alert>
              )}
              
              <Form.Group className="mb-4">
                <Form.Label>Select College</Form.Label>
                {fetchingColleges ? (
                  <div className="text-center py-2">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Loading colleges...
                  </div>
                ) : (
                  <Form.Select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                  >
                    <option value="">Choose a college...</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name} - {college.location}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>

              {selectedCollege && (
                <>
                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label>Select Faculty Members</Form.Label>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedFaculty.length === faculty.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    {faculty.length === 0 ? (
                      <Alert variant="info">
                        No faculty members found for this college. Add faculty members first.
                      </Alert>
                    ) : (
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {faculty.map((fac) => (
                          <Form.Check
                            key={fac.id}
                            type="checkbox"
                            id={`faculty-${fac.id}`}
                            label={
                              <div>
                                <strong>{fac.name}</strong> - {fac.department}
                                <br />
                                <small className="text-muted">{fac.email}</small>
                              </div>
                            }
                            checked={selectedFaculty.includes(fac.id)}
                            onChange={() => handleFacultySelection(fac.id)}
                            className="mb-2"
                          />
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  <Button
                    variant="warning"
                    size="lg"
                    onClick={handleCreateLogins}
                    disabled={loading || selectedFaculty.length === 0}
                    className="px-5"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Logins...
                      </>
                    ) : (
                      `Create Login Accounts (${selectedFaculty.length})`
                    )}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
