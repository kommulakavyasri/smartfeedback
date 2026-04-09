// Component to create admin user
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { auth } from "../firebase/FireBaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase/FireBaseConfig";
import { Button, Card, Container, Alert, Spinner, Form } from "react-bootstrap";

export default function CreateAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bvecCollegeId, setBvecCollegeId] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");

  // Get BVCEC college ID on component mount
  useEffect(() => {
    const getBVCECCollegeId = async () => {
      try {
        const collegesSnapshot = await getDocs(collection(db, "colleges"));
        // Find BVCEC college
        const bvecCollege = collegesSnapshot.docs.find(doc => 
          doc.data().name === "BVCEC"
        );
        if (bvecCollege) {
          setBvecCollegeId(bvecCollege.id);
          setSelectedCollege(bvecCollege.id);
        }
      } catch (error) {
        console.error("Error finding BVCEC college:", error);
      }
    };

    getBVCECCollegeId();
  }, []);

  const handleCreateAdmin = async () => {
    if (!bvecCollegeId) {
      setResult({
        success: false,
        message: "BVCEC college not found. Please add BVCEC college first."
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const adminEmail = "admin@bvcec.ac.in";
      const adminPassword = "Admin@1234";
      const adminName = "System Administrator";

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userData = {
        uid: user.uid,
        name: adminName,
        email: adminEmail,
        role: "admin",
        collegeId: bvecCollegeId,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      };

      await setDoc(doc(db, "users", user.uid), userData);

      setResult({
        success: true,
        message: "Admin user created successfully!",
        adminEmail: adminEmail,
        adminPassword: adminPassword,
        userId: user.uid
      });

    } catch (error) {
      console.error("Error creating admin:", error);
      setResult({
        success: false,
        message: `Failed to create admin: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow">
            <Card.Header className="bg-danger text-white">
              <h4 className="mb-0">Create Admin User</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <p className="mb-4">
                Create the first administrator for the Smart Feedback Analyzer system.
              </p>

              {result && (
                <Alert variant={result.success ? "success" : "danger"} className="mb-4">
                  <Alert.Heading>
                    {result.success ? "Success!" : "Error!"}
                  </Alert.Heading>
                  <p className="mb-0">{result.message}</p>
                  {result.success && (
                    <div className="mt-3">
                      <strong>Admin Credentials:</strong><br />
                      Email: {result.adminEmail}<br />
                      Password: {result.adminPassword}<br />
                      <small className="text-muted">Save these credentials for login</small>
                    </div>
                  )}
                </Alert>
              )}

              <Form.Group className="mb-4">
                <Form.Label>College</Form.Label>
                <div className="alert alert-info">
                  <strong>BVCEC - Bonam Venkata Challamyya College of Engineering</strong><br/>
                  <small className="text-muted">Odalarevu, Andhra Pradesh</small>
                </div>
              </Form.Group>

              <Button
                variant="danger"
                size="lg"
                onClick={handleCreateAdmin}
                disabled={loading || !bvecCollegeId}
                className="px-5"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating Admin...
                  </>
                ) : (
                  "Create Admin User"
                )}
              </Button>

              <div className="mt-4">
                <small className="text-muted">
                  This will create an admin user with the following credentials:
                </small>
                <ul className="text-start small text-muted mt-2">
                  <li>Email: admin@bvcec.ac.in</li>
                  <li>Password: Admin@1234</li>
                  <li>Role: Administrator</li>
                  <li>Access: Full system administration</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
