import React, { useState, useEffect } from 'react';
import './Employment.css';
import Sidebar from '../page/Sidebar';
import { Search, AlertCircle } from "lucide-react"; // 🔍 돋보기 + ❗ 경고 아이콘 추가
import axios from 'axios';

const Employment = () => {
    const [activeTab, setActiveTab] = useState("tab1");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [removingItems, setRemovingItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ 검색어 상태 추가
    const [filteredData, setFilteredData] = useState([]); // ✅ 검색된 데이터 저장


    // ✅ 각 탭에 15개씩 데이터 추가 (페이지네이션 확인 가능)
    const [jobData, setJobData] = useState({
        tab1: [...Array(15)].map((_, i) => ({
            id: i + 1,
            company: "삼성",
            details: `연봉 ${5000 + i * 10}만원 / 한국 / 주 40시간`,
            education: "학사 이상",
            registered: "2025-01-17",
            deadline: `2025-02-${String(1 + (i % 10)).padStart(2, '0')}`,
            isFavorite: true,
        })),
        tab2: [...Array(15)].map((_, i) => ({
            id: i + 16,
            company: "LG",
            details: `연봉 ${4800 + i * 10}만원 / 한국 / 주 40시간`,
            education: "학사 이상",
            registered: "2025-01-17",
            deadline: `2025-02-${String(2 + (i % 10)).padStart(2, '0')}`,
            isFavorite: true,
        })),
        tab3: [...Array(15)].map((_, i) => ({
            id: i + 31,
            company: "네이버",
            details: `연봉 협의 / 서울 / 주 40시간`,
            education: "학사 이상",
            registered: "2025-01-17",
            deadline: `2025-02-${String(3 + (i % 10)).padStart(2, '0')}`,
            isFavorite: true,
        })),
        tab4: [...Array(15)].map((_, i) => ({
            id: i + 46,
            company: "카카오",
            details: `연봉 협의 / 경기 / 주 40시간`,
            education: "학사 이상",
            registered: "2025-01-17",
            deadline: `2025-02-${String(4 + (i % 10)).padStart(2, '0')}`,
            isFavorite: true,
        })),
    });

    useEffect(() => {
        const removeExpiredJobs = () => {
            setJobData((prevJobData) => {
                const updatedJobData = { ...prevJobData };
                let dataChanged = false;

                Object.keys(updatedJobData).forEach((tab) => {
                    const filteredData = updatedJobData[tab].filter((job) => {
                        const deadlineDate = new Date(job.deadline);
                        const today = new Date();
                        const daysDiff = Math.ceil((today - deadlineDate) / (1000 * 60 * 60 * 24));

                        return daysDiff <= 2; // 마감일이 2일 이상 지난 항목 삭제
                    });

                    if (filteredData.length !== updatedJobData[tab].length) {
                        dataChanged = true;
                        updatedJobData[tab] = filteredData;
                    }
                });

                return dataChanged ? updatedJobData : prevJobData;
            });
        };

        removeExpiredJobs(); // 처음 렌더링될 때 한 번 실행
        const interval = setInterval(removeExpiredJobs, 24 * 60 * 60 * 1000); // 24시간마다 실행

        return () => clearInterval(interval);
    }, []);


    const isPastDeadline = (deadline) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate < today;
    };

    const sortByDeadline = (data) => [...data].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // 검색어 필터링 추가
    const paginateData = () => {
        const dataToPaginate = searchQuery.trim() ? filteredData : jobData[activeTab] || [];
        const sortedData = sortByDeadline(dataToPaginate);
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    };

    const totalItems = searchQuery.trim() ? filteredData.length : jobData[activeTab]?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // ⭐ 즐겨찾기 해제 시 즉시 삭제 + 현재 페이지가 비면 이전 페이지로 이동 + 탭 유지
    const toggleFavorite = (jobId) => {
        setRemovingItems((prev) => [...prev, jobId]);

        setTimeout(() => {
            setJobData((prevJobData) => {
                const updatedData = prevJobData[activeTab].filter((job) => job.id !== jobId);
                const updatedJobData = { ...prevJobData, [activeTab]: updatedData };

                // 🔥 삭제 후 최신 데이터 확인
                const sortedItems = sortByDeadline(updatedJobData[activeTab] || []);
                const remainingItemsOnPage = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                // 🔥 현재 페이지가 비었고, 이전 페이지가 있으면 이전 페이지로 이동
                if (remainingItemsOnPage.length === 0 && currentPage > 1) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                return updatedJobData;
            });

            setRemovingItems((prev) => prev.filter((id) => id !== jobId));
        }, 500);
    };

    // ⭐ 즐겨찾기 해제 시 즉시 삭제 + 현재 페이지가 비면 이전 페이지로 이동 + 탭 유지
    const toggleCpFavorite = (jobId) => {
        setRemovingItems((prev) => [...prev, jobId]);

        setTimeout(() => {
            setJobData((prevJobData) => {
                const updatedData = prevJobData[activeTab].filter((job) => job.id !== jobId);
                const updatedJobData = { ...prevJobData, [activeTab]: updatedData };

                // 🔥 삭제 후 최신 데이터 확인
                const sortedItems = sortByDeadline(updatedJobData[activeTab] || []);
                const remainingItemsOnPage = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                // 🔥 현재 페이지가 비었고, 이전 페이지가 있으면 이전 페이지로 이동
                if (remainingItemsOnPage.length === 0 && currentPage > 1) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                return updatedJobData;
            });

            setRemovingItems((prev) => prev.filter((id) => id !== jobId));
        }, 500);
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

    // 검색어 입력 처리 및 검색 후 데이터 저장
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.trim() === "") {
            // ✅ 검색어가 없을 때 → 기존 activeTab 데이터 사용
            setFilteredData([]);
        } else {
            // ✅ 검색어가 있을 때 → 모든 탭의 데이터에서 검색
            const allData = Object.values(jobData).flat();
            const results = allData.filter((job) =>
                job.company.toLowerCase().includes(query) ||
                job.details.toLowerCase().includes(query) ||
                job.education.toLowerCase().includes(query)
            );

            setFilteredData(results); // ✅ 검색된 데이터 저장
        }

        setCurrentPage(1); // ✅ 검색 시 첫 번째 페이지로 이동
    };


    // 추천 채용 즐겨찾기
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8090/api/favorites/my-favorites", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        })
            .then((response) => {
                setFavorites(response.data);

                // ✅ 추천 채용 (`tab2`)에 즐겨찾기 목록 추가
                setJobData((prevJobData) => ({
                    ...prevJobData,
                    tab2: response.data.map((job) => ({
                        id: job.id,
                        title: job.title,
                        regTime: job.regTime,
                        writerName: job.writerName,
                        count: job.count,
                        isFavorite: true, // ⭐ 즐겨찾기 상태
                    }))
                }));
            })
            .catch((error) => {
                console.error("즐겨찾기 목록을 불러오는 중 오류 발생:", error);
            });
    }, []);


    // 교내 채용 즐겨찾기
    const [cpFavorites, setCpFavorites] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8090/api/cp-favorites/my-favorites", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        })
            .then((response) => {
                setCpFavorites(response.data);

                // ✅ 교내 채용 (`tab1`)에 즐겨찾기 목록 추가
                setJobData((prevJobData) => ({
                    ...prevJobData,
                    tab1: response.data.map((job) => ({
                        id: job.id,
                        title: job.title,
                        writerName: job.writerName,
                        regTime: job.regTime,
                        count: job.count,
                        isFavorite: true, // ⭐ 즐겨찾기 상태
                    }))
                }));
            })
            .catch((error) => {
                console.error("교내 채용 즐겨찾기 목록을 불러오는 중 오류 발생:", error);
            });
    }, []);

    // 외부 채용 즐겨찾기
    const [eventFavorites, setEventFavorites] = useState([]);


    // ✅ 외부 채용 (tab3) 데이터 가져오기
    // 📌 외부 채용 즐겨찾기 목록 가져오기
    useEffect(() => {
        axios.get("http://localhost:8090/api/work-favorites", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        })
            .then((response) => {
                setEventFavorites(response.data);

                setJobData((prevJobData) => ({
                    ...prevJobData,
                    tab3: response.data.map((job) => ({
                        id: job.eventNo,
                        title: job.title,
                        eventTerm: job.eventTerm,
                        startDate: job.startDate,
                        endDate: job.endDate,
                        area: job.area,
                        isFavorite: true,
                    }))
                }));
            })
            .catch((error) => {
                console.error("❌ 외부 채용 즐겨찾기 목록 불러오기 오류:", error);
            });
    }, []);





    // ✅ 외부 채용 즐겨찾기 추가/삭제 함수
    const toggleEventFavorite = (eventId) => {
        setRemovingItems((prev) => [...prev, eventId]);

        setTimeout(() => {
            setJobData((prevJobData) => {
                const updatedData = prevJobData[activeTab].filter((job) => job.id !== eventId);
                const updatedJobData = { ...prevJobData, [activeTab]: updatedData };

                // 🔥 삭제 후 최신 데이터 확인
                const sortedItems = sortByDeadline(updatedJobData[activeTab] || []);
                const remainingItemsOnPage = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                // 🔥 현재 페이지가 비었고, 이전 페이지가 있으면 이전 페이지로 이동
                if (remainingItemsOnPage.length === 0 && currentPage > 1) {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                }

                return updatedJobData;
            });

            setRemovingItems((prev) => prev.filter((id) => id !== eventId));
        }, 500);
    };


    return (
        <div>
            <div className="emp-container">
                <main className="emp-main">
                    <Sidebar />
                    <section className="emp-form-container">
                        <h2>나의 채용 정보</h2>
                        <div className="emp-division-line"></div>

                        <div className="emp-search-container">
                            {/* 🔍 검색 입력창 추가 */}
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="emp-search-input"
                            />
                            <Search className="mycounsel-search-icon" />
                        </div>

                        {/* 🔍 검색 중이 아닐 때만 탭 표시 */}
                        {!searchQuery.trim() && (
                            <ul className="emp-tabs">
                                {Object.keys(jobData).map((tab) => (
                                    <li key={tab} className={`emp-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                                        {tab === "tab1" ? "교내 채용" : tab === "tab2" ? "추천 채용" : tab === "tab3" ? "외부 채용" : "인턴 채용"}
                                    </li>
                                ))}
                            </ul>
                        )}


                        {totalItems > 0 && (
                            <div className='emp-getDeadlineStatus'>❌: 마감됨  ⚠️: 임박  ✔️: 진행중</div>
                        )}

                        {/* 🔥 검색 결과가 없을 때 메시지 & 아이콘 표시 */}
                        {totalItems === 0 ? (
                            <div className="no-data-message">
                                <AlertCircle className="no-data-icon" /> {/* 🔴 느낌표 아이콘 추가 */}
                                {searchQuery.trim() ? "검색한 결과가 없습니다" :
                                    (activeTab === "tab1" ? "최근 즐겨찾기한 채용 정보가 없습니다" : "")}
                            </div>
                        ) : activeTab === "tab1" ? (  // ✅ `activeTab === "tab1"`에서 교내 채용 출력
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>즐겨찾기</th>
                                        <th>번호</th>
                                        <th>제목</th>
                                        <th>작성자</th>
                                        <th>작성일</th>
                                        <th>조회수</th>
                                        <th>마감 상태</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {jobData["tab1"].length > 0 ? jobData["tab1"].map((job, index) => (
                                        <tr key={job.id}>
                                            <td>
                                                <span className="star" onClick={() => toggleCpFavorite(job.id)} style={{ cursor: 'pointer', color: 'gold' }}>
                                                    ⭐
                                                </span>
                                            </td>
                                            <td>{index + 1}</td>
                                            <td>{job.title}</td>
                                            <td>{job.writerName}</td>
                                            <td>{job.regTime?.split('T')[0]}</td>
                                            <td>{job.count}</td>
                                            <td>{getDeadlineStatus(job.deadline)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center" }}>교내 채용 데이터가 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : activeTab === "tab2" ? (  // ✅ `activeTab === "tab2"`에서 추천 채용 출력
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>즐겨찾기</th>
                                        <th>번호</th>
                                        <th>제목</th>
                                        <th>작성자</th>
                                        <th>작성일</th>
                                        <th>조회수</th>
                                        <th>마감 상태</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {jobData["tab2"].length > 0 ? jobData["tab2"].map((job, index) => (
                                        <tr key={job.id}>
                                            <td>
                                                <span className="star" onClick={() => toggleFavorite(job.id)} style={{ cursor: 'pointer', color: 'gold' }}>
                                                    ⭐
                                                </span>
                                            </td>
                                            <td>{index + 1}</td>
                                            <td>{job.title}</td>
                                            <td>{job.writerName}</td>
                                            <td>{job.regTime?.split('T')[0]}</td>
                                            <td>{job.count}</td>
                                            <td>{getDeadlineStatus(job.deadline)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center" }}>추천 채용 데이터가 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : activeTab === "tab3" ? (  // ✅ 외부 채용 즐겨찾기 표시
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>즐겨찾기</th>
                                        <th>번호</th>
                                        <th>제목</th>
                                        <th>행사 기간</th>
                                        <th>지역</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {jobData["tab3"].length > 0 ? jobData["tab3"].map((job, index) => (
                                        <tr key={job.id}>
                                            <td>
                                                <span className="star" onClick={() => toggleEventFavorite(job.id)} style={{ cursor: 'pointer', color: 'gold' }}>
                                                    ⭐
                                                </span>
                                            </td>
                                            <td>{index + 1}</td>
                                            <td>{job.title}</td>
                                            <td>{job.startDate} ~ {job.endDate}</td>
                                            <td>{job.area}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center" }}>외부 채용 데이터가 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div> {/* ✅ 다른 탭의 컨텐츠 렌더링 가능 */}</div>
                        )}



                        {/* 페이지네이션 (2페이지 이상일 때만 표시) */}
                        {totalPages > 1 && (
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
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Employment;
