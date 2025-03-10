import React, { useMemo, useState, useEffect } from 'react';
import './Program.css';
import Sidebar from '../page/Sidebar';
import { Search, AlertCircle } from "lucide-react"; // 🔍 돋보기 + ❗ 경고 아이콘 추가

const Program = () => {
    const [activeTab, setActiveTab] = useState("tab1");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [removingItems, setRemovingItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ 검색어 상태 추가
    const [filteredData, setFilteredData] = useState([]); // ✅ 검색된 데이터 저장

    const [programData, setProgramData] = useState({
        tab1: [...Array(20)].map((_, i) => ({
            id: i + 1,
            name: `프로그램 ${String.fromCharCode(65 + i)}`,
            details: `${String.fromCharCode(65 + i)} 하기`,
            date: `2025-01-${String(i + 1).padStart(2, '0')}`,
            deadline: `2025-02-${String((i % 10) + 1).padStart(2, '0')}`,
            capacity: 30,
        })),
        tab2: [...Array(15)].map((_, i) => ({
            id: i + 16,
            name: `즐겨찾기 프로그램 ${String.fromCharCode(65 + i)}`,
            details: `${String.fromCharCode(65 + i)} 하기`,
            date: `2025-01-${String(i + 1).padStart(2, '0')}`,
            deadline: `2025-02-${String((i % 10) + 1).padStart(2, '0')}`,
            capacity: 25,
        })),
    });

    // 마감일이 지난 프로그램 자동 삭제


    // 현재 페이지 데이터 가져오기 (마감일 순 정렬)
    const currentData = useMemo(() => {
        const sortedData = [...(programData[activeTab] || [])].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [programData, activeTab, currentPage]);

    // 프로그램 삭제
    const removeProgram = (tab, programId) => {
        setRemovingItems((prev) => [...prev, programId]);

        setTimeout(() => {
            setProgramData((prevProgramData) => {
                const updatedTabData = prevProgramData[tab].filter((program) => program.id !== programId);
                const updatedProgramData = { ...prevProgramData, [tab]: updatedTabData };

                return updatedProgramData;
            });

            setRemovingItems((prev) => prev.filter((id) => id !== programId));
        }, 500);
    };

    // 프로그램 삭제 후 페이지 자동 조정
    // ✅ 마감일이 지난 프로그램 삭제하는 useEffect (기존 코드 유지)
    useEffect(() => {
        const autoRemoveExpiredPrograms = () => {
            setProgramData((prevProgramData) => {
                let dataChanged = false;
                const updatedProgramData = Object.keys(prevProgramData).reduce((acc, tab) => {
                    const filteredData = prevProgramData[tab].filter((program) => {
                        const deadlineDate = new Date(program.deadline);
                        const today = new Date();
                        const daysDiff = Math.ceil((today - deadlineDate) / (1000 * 60 * 60 * 24));

                        return daysDiff <= 2; // ✅ 마감일이 2일 이상 지난 것 삭제
                    });

                    if (filteredData.length !== prevProgramData[tab].length) {
                        dataChanged = true;
                    }

                    acc[tab] = filteredData;
                    return acc;
                }, {});

                return dataChanged ? updatedProgramData : prevProgramData;
            });
        };

        autoRemoveExpiredPrograms();
        const interval = setInterval(autoRemoveExpiredPrograms, 24 * 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // ✅ 검색 결과 변경 시 1페이지로 이동하는 useEffect (새롭게 추가)
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData]);

    // 전체 선택
    const handleSelectAll = () => {
        const allIds = currentData.map(item => item.id);
        setSelectedItems(selectedItems.length === allIds.length ? [] : allIds);
    };

    // 선택한 항목 삭제 (애니메이션 후 삭제)
    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        if (window.confirm("선택한 항목을 삭제하시겠습니까?")) {
            setRemovingItems(selectedItems); // ✅ 삭제 애니메이션 적용

            setTimeout(() => {
                setProgramData((prevProgramData) => ({
                    ...prevProgramData,
                    tab1: prevProgramData.tab1.filter(item => !selectedItems.includes(item.id)) // ✅ 탭 1에서만 삭제
                }));
                setSelectedItems([]);
                setRemovingItems([]); // ✅ 삭제 완료 후 초기화
            }, 500); // ✅ 0.5초 후 삭제
        }
    };

    // 🕒 마감 상태 계산 함수
    const getDeadlineStatus = (deadline) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);

        const timeDiff = deadlineDate - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) return "❌";
        if (daysRemaining <= 2) return "⚠️";
        return "✔️";
    };

    const totalItems = searchQuery.trim() ? filteredData.length : programData[activeTab]?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const isPastDeadline = (deadline) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate < today;
    };

    const [selectedItems, setSelectedItems] = useState([]); // ✅ 초기값을 빈 배열로 설정

    const toggleSelectItem = (id) => {
        setSelectedItems((prev) =>
            Array.isArray(prev)  // ✅ prev가 배열인지 확인 후 업데이트
                ? (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
                : [id]
        );
    };

    // 검색어 입력 처리
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.trim() === "") {
            // ✅ 검색어가 없을 때 → 기존 activeTab 데이터 사용
            setFilteredData([]);
        } else {
            // ✅ 검색어가 있을 때 → 모든 탭의 데이터를 합쳐서 필터링
            const allData = Object.values(programData).flat();
            const results = allData.filter((program) =>
                program.name.toLowerCase().includes(query) ||
                program.details.toLowerCase().includes(query) ||
                program.date.toLowerCase().includes(query) ||
                program.deadline.toLowerCase().includes(query)
            );

            setFilteredData(results); // ✅ 검색된 데이터 저장
        }

        setCurrentPage(1); // ✅ 검색 시 첫 번째 페이지로 이동
    };

    // 검색 결과에도 페이지네이션 적용
    const paginatedData = useMemo(() => {
        const dataToPaginate = searchQuery.trim() ? filteredData : programData[activeTab] || [];
        const sortedData = [...dataToPaginate].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        const totalFilteredPages = Math.ceil(sortedData.length / itemsPerPage);

        // ✅ 현재 페이지가 존재하지 않는다면 자동으로 마지막 페이지로 이동
        if (currentPage > totalFilteredPages) {
            setCurrentPage(totalFilteredPages > 0 ? totalFilteredPages : 1);
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [searchQuery, filteredData, programData, activeTab, currentPage]);



    return (
        <div className="myprogram-container">
            <main className="myprogram-main">
                <Sidebar />
                <section className="myprogram-form-container">
                    <h2>나의 취업 프로그램</h2>
                    <div className="myprogram-division-line"></div>
                    <div className="myprogram-search-container">
                        {/* 🔍 검색 입력창 추가 */}
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="myprogram-search-input"
                        />
                        <Search className="myprogram-search-icon" />
                    </div>

                    {/* 🔍 검색 중이 아닐 때만 탭 표시 */}
                    {!searchQuery.trim() && (
                        <ul className="myprogram-tabs">
                            <li className={`myprogram-tab ${activeTab === "tab1" ? "active" : ""}`}
                                onClick={() => setActiveTab("tab1")}>
                                신청한 프로그램
                            </li>
                            <li className={`myprogram-tab ${activeTab === "tab2" ? "active" : ""}`}
                                onClick={() => setActiveTab("tab2")}>
                                즐겨찾기한 프로그램
                            </li>
                        </ul>
                    )}

                    {totalItems > 0 && (
                        <div className='myprogram-getDeadlineStatus'>
                            <span>❌: 마감됨  ⚠️: 임박  ✔️: 진행중</span>

                            {/* 🔍 검색 중이 아닐 때만 삭제 버튼 표시 */}
                            {!searchQuery.trim() && activeTab === "tab1" && (
                                <button className="myprogram-delete-btn" onClick={handleDeleteSelected}>
                                    삭제
                                </button>
                            )}
                        </div>
                    )}

                    {/* ✅ 검색 결과가 없을 때 메시지 + 아이콘만 표시, 테이블 숨김 */}
                    {(searchQuery.trim() && filteredData.length === 0) || (!searchQuery.trim() && currentData.length === 0) ? (
                        <div className="no-data-message">
                            <AlertCircle className="no-data-icon" /> {/* 🔴 느낌표 아이콘 추가 */}
                            {searchQuery.trim() ? "검색한 결과가 없습니다" :
                                (activeTab === "tab1" ? "최근 신청한 취업 프로그램이 없습니다" : "최근 즐겨찾기한 채용 프로그램이 없습니다")}
                        </div>
                    ) : (
                        <>
                            {/* ✅ 검색 중이 아닐 때만 테이블과 페이지네이션 표시 */}
                            <table className="myprogram-table">
                                <thead>
                                    <tr>

                                        {/* 🔍 검색 중이 아닐 때만 "전체 선택" 컬럼 표시 */}
                                        {!searchQuery.trim() && activeTab === "tab1" && (
                                            <th onClick={handleSelectAll} style={{ cursor: "pointer", textAlign: "center" }}>
                                                {selectedItems.length > 0 && selectedItems.length === currentData.length ? "✔️" : "✔️"}
                                            </th>
                                        )}

                                        {/* 🔍 검색 중이 아닐 때만 "즐겨찾기" 컬럼 표시 */}
                                        {!searchQuery.trim() && activeTab === "tab2" && <th>즐겨찾기</th>}
                                        <th>날짜</th>
                                        <th>프로그램명</th>
                                        <th>프로그램 내용</th>
                                        <th>정원</th>
                                        <th>마감일</th>
                                        <th>마감 상태</th>  {/* ✅ 마감 상태 컬럼 추가 */}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.map((program) => (

                                        <tr key={program.id}
                                            className={removingItems.includes(program.id)
                                                ? (activeTab === "tab1"
                                                    ? "fade-out-right" : "fade-out-left")
                                                : ""}
                                            style={{ cursor: "pointer", textAlign: "center" }}
                                        >

                                            {/* ✅ 검색 중이 아닐 때만 체크박스 표시 */}
                                            {activeTab === "tab1" && !searchQuery && (
                                                <td className="myprogram-checkbox-container">
                                                    <input
                                                        type="checkbox"
                                                        id={`checkbox-${program.id}`}
                                                        checked={selectedItems.includes(program.id)}
                                                        onChange={() => toggleSelectItem(program.id)}
                                                        style={{ display: "none" }}
                                                    />
                                                    <label htmlFor={`checkbox-${program.id}`} className="myprogram-checkbox-label"></label>
                                                </td>
                                            )}

                                            {/* ✅ 검색 중이 아닐 때만 즐겨찾기 표시 */}
                                            {activeTab === "tab2" && !searchQuery && (
                                                <td>
                                                    <span className="myprogram-star"
                                                        onClick={() => removeProgram("tab2", program.id)}
                                                        style={{ cursor: 'pointer', color: 'gold' }}
                                                    >
                                                        ⭐
                                                    </span>
                                                </td>
                                            )}

                                            <td className={isPastDeadline(program.deadline) ? "gray-text" : ""}>{program.date}</td>
                                            <td className={isPastDeadline(program.deadline) ? "gray-text" : ""}>{program.name}</td>
                                            <td className={isPastDeadline(program.deadline) ? "gray-text" : ""}>{program.details}</td>
                                            <td className={isPastDeadline(program.deadline) ? "gray-text" : ""}>{program.capacity}명</td>
                                            <td className={isPastDeadline(program.deadline) ? "gray-text" : ""}>{program.deadline}</td>
                                            <td>{getDeadlineStatus(program.deadline)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 페이지네이션 (2페이지 이상일 때만 표시) */}
                            {paginatedData.length > 0 && totalPages > 1 && (
                                <div className="emp-pagination">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            className={currentPage === i + 1 ? "active" : ""}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div >
    );
};

export default Program;
