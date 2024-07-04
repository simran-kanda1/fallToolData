import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase'; 
import './SubmissionsTable.css'; 

const EmailSubmissions = () => {
  const [email, setEmail] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = async (email) => {
    setLoading(true);
    setError(null);
    setSubmissions([]);

    try {
      console.log(`Fetching submissions for email: ${email}`);

      const submissionsCollection = collection(db, `users/${email}/submissions`);
      const submissionsSnapshot = await getDocs(submissionsCollection);

      console.log(`Submissions snapshot for ${email}:`, submissionsSnapshot);
      console.log(`Submissions size for ${email}:`, submissionsSnapshot.size);
      console.log(`Submissions empty for ${email}:`, submissionsSnapshot.empty);

      if (submissionsSnapshot.empty) {
        console.log(`No submissions found for email: ${email}`);
        setLoading(false);
        return;
      }

      const submissionsData = await Promise.all(
        submissionsSnapshot.docs.map(async (submissionDoc) => {
          const data = submissionDoc.data();
          const timestamp = data.timestamp;
          const fileName = data.fileName;

          const fileRef = ref(storage, `${email}/uploads/${timestamp}/${fileName}`);
          const downloadURL = await getDownloadURL(fileRef);

          return {
            id: submissionDoc.id,
            email,
            ...data,
            downloadURL,
          };
        })
      );

      console.log('Fetched submissions data:', submissionsData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (email.trim()) {
      fetchSubmissions(email.trim());
    } else {
      setError('Please enter a valid email address.');
    }
  };

  return (
    <div className="login-container">
      <h1>Find Submissions by Email</h1>
      <form onSubmit={handleSearch} className="email-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          required
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div>Loading...</div>}

      {error && <div className="error-message">Error: {error}</div>}

      {submissions.length > 0 && (
        <div className="submissions-table-container">
          <h1>Submissions for {email}</h1>
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>File Name</th>
                <th>Questions</th>
                <th>Timestamp</th>
                <th>Download URL</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.email}</td>
                  <td>{submission.fileName}</td>
                  <td>{submission.questions}</td>
                  <td>{new Date(submission.timestamp).toLocaleString()}</td>
                  <td>
                    <a href={submission.downloadURL} target="_blank" rel="noopener noreferrer">
                      Download Document
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {submissions.length === 0 && !loading && !error && (
        <div>No submissions found for the provided email.</div>
      )}
    </div>
  );
};

export default EmailSubmissions;
