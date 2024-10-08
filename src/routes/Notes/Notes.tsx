import Header from "./Header/Header";
import Aside from "./Aside/Aside";
import Note from "./Note/Note";
import { useEffect, useState } from "react";
import './Notes.css'
import NoteType from "../../Types/Note.ts"
import TagType from "../../Types/Tag.ts"

export default function Notes() {
    const [currentNote, setCurrentNote] = useState<NoteType>({
        created: 0,
        files: [],
        id: 0,
        last_edited: 0,
        tags: [],
        text: "",
        times_edited: 0,
        title: "",
        user_id: 0
    });
    const [currentNoteList, setCurrentNoteList] = useState<NoteType[]>([]);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("");
    const [sortType, setSortType] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>("date");
    const [dateRange, setDateRange] = useState<[number, number]>([0, 0]);
    const [dateModif, setDateModif] = useState<[number, number]>([0, 0]);
    const [userTags, setUserTags] = useState<TagType[]>([]);


    function resetState() {
        setCurrentSearchQuery("");
        setSortType(false);
        setSortBy("date");
        setDateRange([0, 0]);
    }

    //function for constructing url of request to API
    function constructUrl() {
        const baseUrl = "http://localhost:3030/notes?";
        const searchQuery = "title=" + currentSearchQuery
        let requestUrl: string;
        let sortTypeString;

        const dateString: string = "&date=" + dateRange[0] + "-" + dateRange[1];
        const dateModifString: string = "&date_modif=" + dateModif[0] + "-" + dateModif[1];

        if (sortType) {
            sortTypeString = "asc";
        }
        else {
            sortTypeString = "desc";
        }
        // eslint-disable-next-line prefer-const
        requestUrl = baseUrl + searchQuery + "&sort_by=" + sortBy + "&sort_type=" + sortTypeString + dateString + dateModifString;
        console.log("url in constructUrl:", requestUrl);
        return requestUrl;
    }

    async function getNotes(requestUrl: string) {
        const response = await fetch(requestUrl, {
            method: "GET",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include",
        })
        const body = await response.json();
        console.log(body);
        const noteList: NoteType[] = body.data.notes;
        console.log("note list:", noteList);
        setCurrentNoteList(noteList);
    }

    useEffect(() => {
        getNotes(constructUrl());
        getUserTags();
        console.log("in useEffect")
    }, [sortType, sortBy])

    function handleSearchInput(e: any) {
        const lowerCase = e.target.value.toLowerCase();
        if (lowerCase === "") {
            getNotes("http://localhost:3030/notes");
            setCurrentSearchQuery("");
        }
        else {
            setCurrentSearchQuery(lowerCase);
        }
    }

    function handleSearching(e: Event) {
        e.preventDefault();
        console.log(currentSearchQuery);
        getNotes(constructUrl());
    }

    function updateNoteList() {
        getNotes("http://localhost:3030/notes");
        setCurrentNote({
            created: 0,
            files: [],
            id: 0,
            last_edited: 0,
            tags: [],
            text: "",
            times_edited: 0,
            title: "",
            user_id: 0
        });
    }

    async function createNote() {
        const response = await fetch("http://localhost:3030/notes", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                "text": "",
                "title": ""
            }),
            credentials: "include",
        })
        const body = await response.json();
        console.log(body);
        const data: NoteType | null = body.data;
        if (data !== null) {
            setCurrentNote(data);
            console.log(data.id);
        }
        getNotes("http://localhost:3030/notes");
    }

    function handleCreatingNote() {
        createNote();
        console.log("in creatingNote");
    }

    function handleChoosingNote(note: NoteType) {
        console.log(note);
        setCurrentNote(note);
    }

    function handleSortTypeChange() {
        setSortType(!sortType);
        console.log(sortType);
    }

    function handleSortByChange(sort: string) {
        setSortBy(sort);
    }

    function handleDateRangeChange(startDate: number, endDate: number) {
        console.log(startDate, endDate);
        setDateRange([startDate, endDate]);
    }

    function handleDateModifChange(startDate: number, endDate: number) {
        console.log(startDate, endDate);
        setDateModif([startDate, endDate]);
    }

    function handleFiltering() {
        getNotes(constructUrl());
    }

    function handleResetfiltering() {
        getNotes("http://localhost:3030/notes");
        //maybe set all state to default somehow idk
        resetState();
    }

    async function getUserTags() {
        const response = await fetch("http://localhost:3030/tags", {
            method: "GET",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include",
        })
        const body = await response.json();
        setUserTags(body.data.tags)
    }

    return (
        <div className="notes-page-container">
            {/* <button onClick={getUserTags}>tags</button> */}
            <Header handleResetfiltering={handleResetfiltering} handleFiltering={handleFiltering} handleDateRangeChange={handleDateRangeChange} handleDateModifChange={handleDateModifChange} handleSortByChange={handleSortByChange} sortType={sortType} handleSortTypeChange={handleSortTypeChange} handleSearching={handleSearching} handleSearchInput={handleSearchInput} handleCreatingNote={handleCreatingNote} />
            <Aside currentNoteList={currentNoteList} handleChoosingNote={handleChoosingNote} />
            <Note getUserTags={getUserTags} userTags={userTags} currentNote={currentNote} updateNoteList={updateNoteList} />
        </div>
    );
}
