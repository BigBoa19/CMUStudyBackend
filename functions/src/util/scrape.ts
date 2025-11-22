
const BASE_URL = 'https://directory.andrew.cmu.edu'
const SEARCH_ENDPOINT = '/index.cgi'
const STUDENT_TERM = "<br /><p><b>Student Class Level:</b><br />"
const DEPARTMENT_TERM = "Department with which this person is affiliated:</b><br />"
const NAMES = "</p><h2>Names by Which This Person is Known"
const N_LEN = NAMES.length
const DT_LEN = DEPARTMENT_TERM.length
const ST_LEN = STUDENT_TERM.length




const fetchFromDirectory = async (target_user: string) => {
    const formData = new URLSearchParams();
    formData.append('search', target_user);
    formData.append('action', 'Search');
    formData.append('searchtype', 'basic');
    formData.append('activetab', 'basic');

    const payload = {
        headers: {
            'content-type': "application/x-www-form-urlencoded"
        },
        method: "POST",
        body: formData
    };

    try {
        const url = BASE_URL + SEARCH_ENDPOINT
        const data = await fetch(url, payload);
        return await data.text()
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

const parseFromDir = async (student: string) => {
    const input_data = await fetchFromDirectory(student)
    if (!(input_data.includes(STUDENT_TERM))){
        return null;
        
        // console.log("I made it here")
    }
    const index1 = input_data.indexOf(DEPARTMENT_TERM)
    const index2 = input_data.indexOf(STUDENT_TERM)
    const major = input_data.substring(index1 + DT_LEN, index2)
    const index3 = input_data.indexOf(NAMES)
    const year = input_data.substring(index2 + ST_LEN, index3)
    console.log("Major: ", major, "Year: ", year)

}


parseFromDir("jmackey");
