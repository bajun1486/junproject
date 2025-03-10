import axios from "axios";
import React, { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RecruitmentSidebar from "../MainPage/RecruitmentSidebar";
import WorkboardPagination from "./WorkBoardPagination"; // WorkboardPagination 컴포넌트 임포트
import "./WorkBoard.css"; // CSS 파일
import Graystar from "../img/Graystar.png"; // 비즐겨찾기 이미지
import Goldstar from "../img/Goldstar.png"; // 즐겨찾기 이미지
import { LoginContext } from "../../login/security/contexts/LoginContextProvider";

function WorkBoard() {
    const navigate = useNavigate();
    const [searchResult, setSearchResult] = useState([]); // 초기 상태를 빈 배열로 설정
    const [searchOption, setSearchOption] = useState({
        startDate: "",
        endDate: "",
        region: "",
        searchQuery: "",
    });

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBoardCount, setTotalBoardCount] = useState(0);
    const [boardsPerPage, setBoardsPerPage] = useState(30); // 기본 30개

    function convertToYYYYMMDD(dateString) {
        const [year, month, day] = dateString.split("-");
        return `${year}${month}${day}`;
    }

    // 🔹 API 호출 (검색 기능)
    const fetchWorkBoards = useCallback((page) => {
        const params = {
            returnType: "XML", // 🔹 XML 대신 JSON으로 요청
            callTp: "L",
            startPage: page,
            display: boardsPerPage,
        };

        if (searchOption.startDate) {
            params.srchBgnDt = convertToYYYYMMDD(searchOption.startDate); // YYYY-MM-DD -> YYYYMMDD 변환
        }
        if (searchOption.endDate) {
            params.srchEndDt = convertToYYYYMMDD(searchOption.endDate); // YYYY-MM-DD -> YYYYMMDD 변환
        }
        if (searchOption.region) {
            params.areaCd = searchOption.region;
        }
        if (searchOption.searchQuery) {
            params.keyword = searchOption.searchQuery;
        }
        console.log("📌 요청 매개변수:", params); // 요청 매개변수 로그 출력

        axios.get('http://localhost:8090/api/work/board/search', { params })
            .then((response) => {
                console.log("📌 전체 API 응답:", response); // 전체 응답 로그 출력
                console.log("📌 API 응답 데이터:", response.data); // 응답 데이터 출력
                setSearchResult(response.data); // 검색 결과 상태 설정
                setTotalBoardCount(response.data.totalCount); // 총 게시물 수 설정
            })
            .catch((error) => {
                console.error("❌ API 요청 오류:", error);
            });
    }, [searchOption, boardsPerPage]);

    // 컴포넌트가 처음 마운트될 때 API 호출
    useEffect(() => {
        fetchWorkBoards(currentPage); // 초기 데이터 호출
    }, [currentPage, fetchWorkBoards]);

    useEffect(() => {
        console.log("🎯 검색 결과:", searchResult);
    }, [searchResult]);

    // 🔹 상세 페이지 이동
    const onDetail = (workBoard) => {
        const eventNo = workBoard.eventNo; // workBoard에서 eventNo 가져오기
        const areaCd = workBoard.areaCd;

        console.log("🔍 eventNo:", eventNo, "areaCd:", areaCd);

        navigate(`/work_board/WorkBoardDetail/${eventNo}?areaCd=${areaCd}`); // URL 파라미터로 eventNo 전달
    };

    // 🔹 검색 조건 변경 처리
    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setSearchOption((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // 🔹 날짜 버튼 클릭 시 설정
    const setDateRange = (days) => {
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (days) {
            case "today":
                endDate = new Date(today);
                break;
            case "1week":
                endDate.setDate(today.getDate() + 7);
                break;
            case "1month":
                endDate.setMonth(today.getMonth() + 1);
                break;
            case "3months":
                endDate.setMonth(today.getMonth() + 3);
                break;
            case "6months":
                endDate.setMonth(today.getMonth() + 6);
                break;
            default:
                break;
        }

        setSearchOption((prevState) => ({
            ...prevState,
            startDate: startDate.toISOString().split("T")[0], // YYYY-MM-DD 형식
            endDate: endDate.toISOString().split("T")[0], // YYYY-MM-DD 형식
        }));
    };

    // 🔹 검색 버튼 클릭 시 호출
    const handleSearch = () => {
        setCurrentPage(1); // 검색 시 첫 페이지로 초기화
        fetchWorkBoards(1); // 검색 결과를 가져오는 함수 호출
    };

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalBoardCount / boardsPerPage);
    const validTotalPages = totalPages > 0 ? totalPages : 1; // 0 이하일 경우 기본값 1

    const { isLogin } = useContext(LoginContext); // ✅ 로그인 상태 가져오기
    const [favorites, setFavorites] = useState({}); // ✅ 즐겨찾기 상태 관리

    // ✅ 사용자의 즐겨찾기 목록 불러오기
    const fetchFavorites = useCallback(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        axios.get("http://localhost:8090/api/work-favorites", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                const favoriteIds = response.data; // eventNo 목록
                const favoriteMap = favoriteIds.reduce((acc, eventNo) => {
                    acc[eventNo] = true;  // ✅ 즐겨찾기한 eventNo를 true로 설정
                    return acc;
                }, {});
                setFavorites(favoriteMap);
            })
            .catch((error) => {
                console.error("❌ 즐겨찾기 목록 불러오기 오류:", error);
            });
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // ✅ 즐겨찾기 추가/삭제 기능
    const toggleFavorite = (eventNo) => {
        if (!isLogin) {
            alert("로그인이 필요합니다!");
            return;
        }

        const isFavorite = favorites[eventNo];
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("로그인이 필요합니다!");
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        if (isFavorite) {
            axios.delete(`http://localhost:8090/api/work-favorites/${eventNo}`, { headers })
                .then(() => {
                    setFavorites(prevFavorites => ({ ...prevFavorites, [eventNo]: false }));
                    alert("즐겨찾기에서 삭제되었습니다!");
                })
                .catch((error) => {
                    console.error("즐겨찾기 삭제 중 오류 발생:", error);
                });
        } else {
            axios.post(`http://localhost:8090/api/work-favorites/${eventNo}`, {}, { headers })
                .then(() => {
                    setFavorites(prevFavorites => ({ ...prevFavorites, [eventNo]: true }));
                    alert("즐겨찾기에 추가되었습니다!");
                })
                .catch((error) => {
                    console.error("즐겨찾기 추가 중 오류 발생:", error);
                });
        }
    };

    return (
        <div className="workboard-board-with-sidebar">
            <RecruitmentSidebar />
            <div className="workboard-board-content-area">
                <section className="workboard-board-list">
                    <div id="search">
                        <div className="workboard-b-container">
                            <h3 className="workboard-title">고용24 훈련 및 채용검색</h3>

                            {/* 행사기간 입력 필드 */}
                            <table className="event-table">
                                <tbody>
                                    <tr>
                                        <td>행사기간</td>
                                        <td>
                                            <input type="date" name="startDate" value={searchOption.startDate} onChange={handleOnChange} />
                                            <span> ~ </span>
                                            <input type="date" name="endDate" value={searchOption.endDate} onChange={handleOnChange} />
                                            <div className="button-container">
                                                <button className="workboard-button" onClick={() => setDateRange("today")}>오늘</button>
                                                <button className="workboard-button" onClick={() => setDateRange("1week")}>1주일</button>
                                                <button className="workboard-button" onClick={() => setDateRange("1month")}>1개월</button>
                                                <button className="workboard-button" onClick={() => setDateRange("3months")}>3개월</button>
                                                <button className="workboard-button" onClick={() => setDateRange("6months")}>6개월</button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* 지역 선택 */}
                            <table className="search-table">
                                <tbody>
                                    <tr>
                                        <td>지역</td>
                                        <td>
                                            <select name="region" value={searchOption.region} onChange={handleOnChange}>
                                                <option value="">전체</option>
                                                <option value="51">서울, 강원</option>
                                                <option value="52">부산, 경남</option>
                                                <option value="53">대구, 경북</option>
                                                <option value="54">경기, 인천</option>
                                                <option value="55">광주, 전라, 제주</option>
                                                <option value="56">대전, 충청</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>검색어</td>
                                        <td>
                                            <input
                                                type="text"
                                                name="searchQuery"
                                                value={searchOption.searchQuery}
                                                onChange={handleOnChange}
                                            />
                                            <button className="workboard-button" onClick={handleSearch}>검색</button>

                                            {/* 보여줄 개수 선택 드롭다운 추가 */}
                                            <select className="workboard-button-dropdown" value={boardsPerPage} onChange={(e) => {
                                                setBoardsPerPage(Number(e.target.value));
                                                setCurrentPage(1); // 페이지를 첫 페이지로 초기화
                                            }}>
                                                <option value="10">10개 적용</option>
                                                <option value="20">20개 적용</option>
                                                <option value="30">30개 적용</option>
                                                <option value="50">50개 적용</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>

                    {/* 검색 결과 목록 */}
                    <div className="workboard-b-list">
                        {searchResult && searchResult.length > 0 ? (
                            searchResult.map((workBoard) => (
                                <div className="workboard-card" key={workBoard.eventNo}>
                                    {/* ✅ 제목에만 상세보기 적용 */}
                                    <h4 onClick={() => onDetail(workBoard)} style={{ cursor: "pointer", textDecoration: "underline" }}>
                                        {workBoard.title}
                                    </h4>

                                    <p>{workBoard.eventTerm}</p>
                                    <p>{workBoard.startDate} ~ {workBoard.endDate}</p>
                                    <p>{workBoard.area}</p>

                                    {/* ⭐ 즐겨찾기 버튼 */}
                                    <div className="favorite-icon" onClick={(event) => {
                                        event.stopPropagation(); // ✅ 클릭 이벤트 방지
                                        toggleFavorite(workBoard.eventNo);
                                    }}>
                                        <img
                                            src={favorites[workBoard.eventNo] ? Goldstar : Graystar}
                                            alt="즐겨찾기"
                                            style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>검색 결과가 없습니다.</p> // 결과가 없을 때 메시지 표시
                        )}
                    </div>

                    {/* 페이지네이션 추가 */}
                    <WorkboardPagination
                        currentPage={currentPage}
                        totalPages={validTotalPages}
                        onPageChange={setCurrentPage}
                    />
                </section>
            </div>
        </div>
    );
}

export default WorkBoard;
