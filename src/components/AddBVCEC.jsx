// Component to add BVCEC college to Firestore
import { useState } from "react";
import { Button, Card, Container, Alert, Spinner } from "react-bootstrap";
import { addBVCECCollege } from "../utils/addBVCEC";
import { seedBVCECUsers } from "../utils/seedBVCECUsers";

export default function AddBVCEC() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [seedResult, setSeedResult] = useState(null);

  const handleAddBVCEC = async () => {
    setLoading(true);
    setResult(null);
    setSeedResult(null);
    
    try {
      const response = await addBVCECCollege();
      setResult(response);
      
      if (response.success) {
        const seedResponse = await seedBVCECUsers();
        setSeedResult(seedResponse);
      }
    } catch (error) {
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
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Add BVCEC College</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <p className="mb-4">
                Click the button below to add BVCEC (Bonam Venkata Chalamayya Engineering College) 
                to the Firestore database.
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

              {seedResult && (
                <Alert variant={seedResult.success ? "info" : "warning"} className="mb-4">
                  <p className="mb-0 fw-bold">{seedResult.message}</p>
                </Alert>
              )}
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddBVCEC}
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
                  This will add BVCEC with the following details:
                </small>
                <ul className="text-start small text-muted mt-2">
                  <li>Name: BVCEC</li>
                  <li>Full Name: Bonam Venkata Chalamayya Engineering College</li>
                  <li>Location: Odalarevu, East Godavari District, Andhra Pradesh</li>
                  <li>Departments: CSE, ECE, EEE, MECH, CIVIL</li>
                  <li>Facilities: Library, Labs, Sports, Hostel, Transport</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
