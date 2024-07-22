import React from "react";
import { useState, useEffect } from "react";
import { ProfileType } from '../utils/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTable, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Home: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [SavedSearchTerms, setSavedSearchTerms] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  // const [viewMode, setViewMode] = useState<string>('card');

  const fetchProfiles = async (page: number, searchTerm: string[]) => {
    setLoading(true);
    console.log(JSON.stringify({ terms: searchTerm }));
    try {
      const response = await fetch(`http://localhost:3000/user/${page}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ terms: searchTerm }),
      });
      const result = await response.json();

      if (Array.isArray(result.data)) {
        setProfiles(prevProfiles => {
          const existingIds = new Set(prevProfiles.map(profile => profile.id));
          const newProfiles = result.data.filter((profile: ProfileType ) => !existingIds.has(profile.id));
          return [...prevProfiles, ...newProfiles];
        });
      } else {
        console.error('Unexpected data format:', result);
      }
    } catch (error) {
      console.error('Error fetching profiles list:', error);
    }
    setLoading(false);
  };

   const handleSearch = () => {
    setProfiles([]); 
    setSavedSearchTerms((prevTerms) => [...prevTerms, searchTerm]);
    setSearchTerm('');
    setPage(1);
    fetchProfiles(1, SavedSearchTerms);
  };

  const handleViewChange = (view: string) => {
    setViewMode(view);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveSearchTerm = (index: number) => {
    const updatedTerms = [...SavedSearchTerms];
    updatedTerms.splice(index, 1);
    setSavedSearchTerms(updatedTerms);
    fetchProfiles(page, updatedTerms);
  };

  useEffect(() => {
    fetchProfiles(page, [searchTerm]);
  }, [page, searchTerm]);

  return (
      <div className="container mx-auto">
        <div className="flex items-center justify-between mt-4 mb-2">
          <div className="flex mt-3 mb-2">          
              <div className="flex flex-wrap items-center flex-grow border-2 border-black rounded p-2">
              {
                SavedSearchTerms.map((term, index) => (
                  <div key={index} className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2 mb-2 flex items-center">
                    {term}
                    <button
                      className="ml-2 p-1 text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => handleRemoveSearchTerm(index)}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} size="sm" />
                    </button>
                  </div>
                ))
              }            
              <form onSubmit={handleSubmit} className="flex items-center justify-between mt-4 mb-2">
                <input
                  type="text"
                  className="border-none outline-none flex-grow bg-transparent p-2 text-black"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                />
                <button className="px-3 py-2 bg-blue-500 text-white rounded" type="submit">
                  Rechercher
                </button>
              </form>
          </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewChange('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              <FontAwesomeIcon icon={faList} className="text-xl" />
            </button>
            <button
              onClick={() => handleViewChange('card')}
              className={`p-2 rounded ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              <FontAwesomeIcon icon={faTable} className="text-xl" />
            </button>
        </div>
      </div>
        {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
        ) : (
          <ProfileTable profiles={profiles} />
        )}    
        <button
          onClick={() => setPage(page + 1)}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Load more
        </button>
    </div>
  );
};

export default Home;

// function setViewModeCard() {
//   setViewMode = 'card';
// }

// function setViewModeTable() {
//   setViewMode = 'table';
// }


function ProfileCard({ profile }: { profile: ProfileType }) {
  return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <img
        src={profile.imageUrl}
        alt={`${profile.firstName} ${profile.lastName}`}
        className="w-full h-40 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-sm mb-1">{profile.jobTitle}</p>
        <p className="text-sm">{profile.email}</p>
      </div>
    </div>
  );
}

function ProfileTable({ profiles }: { profiles: ProfileType[] }) {
  return (
    <table className="mx-auto max-w-7xl">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {profiles.map((profile) => (
              <tr key={profile.id} className='bg-gray-800'>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <img src={profile.imageUrl} alt={profile.firstName} className="w-12 h-12 rounded-full" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{profile.firstName} {profile.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{profile.jobTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{profile.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
  );
}
