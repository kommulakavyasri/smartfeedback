import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Modal, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function FeedbackForm({ onFeedbackSubmitted }) {
  const { user, userProfile } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [faculty, setFaculty] = useState("");
  const [category, setCategory] = useState("teaching");
  const [points, setPoints] = useState(8);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submittedFaculty, setSubmittedFaculty] = useState("");

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!userProfile?.collegeId) return;

      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "faculty"),
          where("collegeId", "==", userProfile.collegeId),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));

        setFacultyList(data);
        if (data.length > 0) setFaculty(data[0].id);
      } catch (err) {
        console.error("Error fetching faculty for form:", err);
      }
    };
    fetchFaculty();
  }, [userProfile?.collegeId]);

  const submit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Please enter feedback");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selected = facultyList.find(f => f.id === faculty)?.name;

      await addDoc(collection(db, "feedback"), {
        faculty: selected,
        facultyId: faculty,
        collegeId: userProfile?.collegeId || "",
        category,
        points,
        text,
        studentId: user.uid,
        createdAt: new Date()
      });

      setSubmittedFaculty(selected);
      setShowModal(true);
      setText("");
      setPoints(8);

      onFeedbackSubmitted && onFeedbackSubmitted();
    } catch {
      setError("Error submitting feedback");
    }

    setLoading(false);
  };

  return (
    <Card className="shadow border-0">
      <Card.Header className="bg-primary text-white text-center">
        <h4>Submit Feedback</h4>
      </Card.Header>

      <Card.Body>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={submit}>

          <Form.Group className="mb-3">
            <Form.Label>Faculty</Form.Label>
            <Form.Select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="teaching">Teaching</option>
              <option value="content">Content</option>
              <option value="communication">Communication</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rating: <strong>{points}/10</strong></Form.Label>
            <Form.Range min={1} max={10} value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your feedback..."
            />
          </Form.Group>

          <Button className="w-100" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Submit Feedback"}
          </Button>

        </Form>
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center">
          <h4 className="text-success">✔ Submitted</h4>
          <p>Feedback for <strong>{submittedFaculty}</strong> added</p>
          <Button onClick={() => setShowModal(false)}>OK</Button>
        </Modal.Body>
      </Modal>
    </Card>
  );
}