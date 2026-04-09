import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { Button, Card, Container, Alert, Spinner } from "react-bootstrap";

export default function AddFaculty() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [bvecCollegeId, setBvecCollegeId] = useState("");

  const facultyData = [
    { name: "Dr. S. R. Reddy", department: "CSE" },
    { name: "Dr. P. V. N. Rao", department: "CSE" },
    { name: "Ms. K. S. Lakshmi", department: "CSE" }
  ];

  useEffect(() => {
    const fetchColleges = async () => {
      const snap = await getDocs(collection(db, "colleges"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setColleges(data);

      const bvcec = data.find(c =>
        c.name?.toLowerCase().includes("bvcec")
      );

      if (bvcec) setBvecCollegeId(bvcec.id);
    };

    fetchColleges();
  }, []);

  const handleAddFaculty = async () => {
    if (!bvecCollegeId) {
      setResult({ success: false, message: "College not found" });
      return;
    }

    setLoading(true);

    try {
      let count = 0;

      for (let f of facultyData) {
        await addDoc(collection(db, "users"), {
          ...f,
          role: "faculty",
          collegeId: bvecCollegeId,
          createdAt: new Date(),
          isActive: true
        });
        count++;
      }

      setResult({
        success: true,
        message: `Added ${count} faculty`
      });
    } catch {
      setResult({ success: false, message: "Error adding faculty" });
    }

    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-info text-white text-center">
          <h4>Add Faculty</h4>
        </Card.Header>

        <Card.Body className="text-center">

          {result && (
            <Alert variant={result.success ? "success" : "danger"}>
              {result.message}
            </Alert>
          )}

          <p className="mb-4">
            Click below to add faculty members to BVCEC college.
          </p>

          <Form.Group className="mb-4">
            <Form.Label>College</Form.Label>
            <div className="alert alert-info">
              <strong>BVCEC - Bonam Venkata Challamyya College of Engineering</strong><br/>
              <small className="text-muted">Odalarevu, Andhra Pradesh</small>
            </div>
          </Form.Group>

          <Button
            size="lg"
            variant="info"
            onClick={handleAddFaculty}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Adding...
              </>
            ) : "Add Faculty"}
          </Button>

        </Card.Body>
      </Card>
    </Container>
  );
}