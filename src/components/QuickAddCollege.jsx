// Quick and simple college addition component
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { Button, Card, Container, Alert, Spinner } from "react-bootstrap";

export default function QuickAddCollege() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addBVCECQuick = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const collegeData = {
        name: "BVCEC",
        fullName: "Bonam Venkata Challamyya College of Engineering",
        location: "Odalarevu, Andhra Pradesh",
        description: "BVCEC is a premier engineering institution offering quality education in various engineering disciplines with state-of-the-art facilities and experienced faculty.",
        facultyCount: 0,
        studentCount: 0,
        establishedYear: 2008,
        affiliatedTo: "JNTU Kakinada",
        website: "https://bvcec.ac.in",
        contactEmail: "info@bvcec.ac.in",
        contactPhone: "+91-8812-234567",
        address: "Odalarevu, Andhra Pradesh - 534275",
        departments: [
          "Computer Science and Engineering",
          "Electronics and Communication Engineering",
          "Electrical and Electronics Engineering",
          "Mechanical Engineering",
          "Civil Engineering"
        ],
        facilities: [
          "Digital Library",
          "Advanced Laboratories",
          "Sports Complex",
          "Hostel Facilities",
          "Transportation",
          "Placement Cell"
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "colleges"), collegeData);
      
      setResult({
        success: true,
        message: "BVCEC college added successfully!",
        collegeId: docRef.id
      });
      
      console.log("BVCEC college added with ID:", docRef.id);
      
    } catch (error) {
      console.error("Error adding BVCEC college:", error);
      setResult({
        success: false,
        error: error.message,
        message: "Failed to add BVCEC college"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">Quick Add BVCEC College</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <p className="mb-4">
                Click the button below to add BVCEC college to the database.
              </p>
              
              {result && (
                <Alert variant={result.success ? "success" : "danger"} className="mb-4">
                  <Alert.Heading>
                    {result.success ? "Success!" : "Error!"}
                  </Alert.Heading>
                  <p className="mb-0">{result.message}</p>
                  {result.success && result.collegeId && (
                    <small className="d-block mt-2">
                      College ID: {result.collegeId}
                    </small>
                  )}
                </Alert>
              )}
              
              <Button
                variant="success"
                size="lg"
                onClick={addBVCECQuick}
                disabled={loading}
                className="px-5"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Adding BVCEC...
                  </>
                ) : (
                  "Add BVCEC College"
                )}
              </Button>
              
              <div className="mt-4">
                <small className="text-muted">
                  This will add BVCEC with all necessary details including:
                </small>
                <ul className="text-start small text-muted mt-2">
                  <li>Name: BVCEC</li>
                  <li>Location: Narsapur, West Godavari District</li>
                  <li>Departments: CSE, ECE, EEE, MECH, CIVIL</li>
                  <li>Facilities: Library, Labs, Sports, Hostel</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
