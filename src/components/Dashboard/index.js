import React, { useEffect, useState } from 'react';
import { db } from 'lib/firebase';
import useSWR, { mutate } from 'swr';
import { Link, navigate } from '@reach/router';
import './Dashboard.css';

const getUserFiles = async (userId) => {
  const doc = await db.collection('users').doc(userId).get();

  if (doc.exists) {
    console.log('User found in database');

    const snapshot = await db
      .collection('users')
      .doc(doc.id)
      .collection('files')
      .get();

    const userFiles = snapshot.map((file) => {
      let { name, content } = file.data();

      return {
        id: file.id,
        name,
        content,
      };
    });

    return userFiles;
  } else {
    console.log('User not found in database, creating a new entry...');

    db.collection('users').doc(userId).set({});

    return [];
  }
};

const createFile = async (userId, fileName) => {
  let res = await db.collection('users').doc(userId).collection('files').add({
    name: fileName,
    content: '',
  });

  return res;
};

const deleteFile = async (userId, fileId) => {
  let res = await db
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(fileId)
    .delete();

  return res;
};

const Dashboard = ({ user, userId }) => {
  const [nameValue, setNameValue] = useState('');
  const { data, error } = useSWR(userId, getUserFiles);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user]);

  if (error) return <p>Error loading data!</p>;
  else if (!data) return <p>Loading...</p>;
  else {
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameValue) {
              createFile(userId, nameValue);
              setNameValue('');
              mutate(userId);
            }
          }}
          className="new-file-form"
        >
          <input
            type="text"
            placeholder="Your new file's name..."
            value={nameValue}
            onChange={(e) => {
              setNameValue(e.target.value);
            }}
          />
          <button type="submit" className="add-button">
            Create
          </button>
        </form>
        <ul className="files-list">
          {data.map((file) => (
            <li key={file.id} className="file">
              <Link to={`/user/$userId}/editor/${file.id}`} className="link">
                {file.name}
              </Link>
              <button
                onClick={() => {
                  deleteFile(userId, file.id).then(() => mutate(userId));
                }}
                className="delete-button"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};

export default Dashboard;
