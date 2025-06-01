// Function to abbreviate institute names
function abbreviateInstituteName(name) {
    if (name.includes("Indian Institute of Technology")) {
        return name.replace("Indian Institute of Technology", "IIT");
    } else if (name.includes("National Institute of Technology")) {
        return name.replace(/.*(National Institute of Technology)/, "NIT");
    }
    return name;
}

// Function to parse ranks (handles preparatory ranks with 'P' suffix)
function parseRank(rank) {
    if (typeof rank === 'string' && rank.endsWith('P')) {
        return parseInt(rank.replace('P', ''));
    }
    return parseInt(rank);
}

// Function to check if a rank is preparatory
function isPreparatoryRank(rank) {
    return typeof rank === 'string' && rank.endsWith('P');
}

// Function to sync the two category dropdowns
function syncCategories(source) {
    const filterCategory = document.getElementById('filter-category');
    const rankCategory = document.getElementById('rank-category');
    
    if (source.id === 'filter-category') {
        rankCategory.value = source.value;
    } else {
        filterCategory.value = source.value;
    }
}

// Function to toggle the information section
function toggleInfoSection() {
    const infoContent = document.getElementById('info-content');
    const isHidden = infoContent.style.display === 'none' || !infoContent.style.display;
    infoContent.style.display = isHidden ? 'block' : 'none';
}

// Function to clear the search input
function clearSearch() {
    const searchInput = document.getElementById('universal-search');
    searchInput.value = '';
    toggleClearButton();
    predictColleges();
}

// Function to toggle the visibility of the clear button
function toggleClearButton() {
    const searchInput = document.getElementById('universal-search');
    const clearButton = document.querySelector('.clear-search');
    clearButton.style.display = searchInput.value ? 'block' : 'none';
}

// Function to populate program (branch) dropdown based on selected institute
function populateProgramDropdown() {
    const institute = document.getElementById('institute').value;
    const specificInstitute = document.getElementById('specific-institute')?.value || 'all';
    let filteredPrograms = [];

    if (institute === 'iit') {
        const iitData = window.jeeData.filter(item => item.institute.startsWith('IIT'));
        if (specificInstitute !== 'all') {
            filteredPrograms = [...new Set(iitData.filter(item => item.institute === specificInstitute).map(item => item.program))];
        } else {
            filteredPrograms = [...new Set(iitData.map(item => item.program))];
        }
    } else if (institute === 'nit') {
        const nitData = window.jeeData.filter(item => item.institute.startsWith('NIT'));
        if (specificInstitute !== 'all') {
            filteredPrograms = [...new Set(nitData.filter(item => item.institute === specificInstitute).map(item => item.program))];
        } else {
            filteredPrograms = [...new Set(nitData.map(item => item.program))];
        }
    }

    const programSelect = document.getElementById('program');
    programSelect.innerHTML = '<option value="all">All Branches</option>';
    filteredPrograms.forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        programSelect.appendChild(option);
    });

    predictColleges();
}

// Function to populate program type dropdown
function populateProgramTypeDropdown() {
    const institute = document.getElementById('institute').value;
    let programTypes = [...new Set(window.jeeData.map(item => item.programType))];

    // Ensure "Bachelor of Architecture (B.Arch)" is included for both IIT and NIT
    if (!programTypes.includes('Bachelor of Architecture (B.Arch)')) {
        programTypes.push('Bachelor of Architecture (B.Arch)');
    }

    // Include "Bachelor of Planning (B.Plan)" only for NIT
    if (institute === 'nit' && !programTypes.includes('Bachelor of Planning (B.Plan)')) {
        programTypes.push('Bachelor of Planning (B.Plan)');
    } else if (institute === 'iit') {
        // Explicitly exclude "Bachelor of Planning (B.Plan)" for IIT
        programTypes = programTypes.filter(type => type !== 'Bachelor of Planning (B.Plan)');
    }

    // Exclude "Bachelor of Technology" when institute is IIT
    if (institute === 'iit') {
        programTypes = programTypes.filter(type => type !== 'Bachelor of Technology');
    }

    // Sort program types for consistency
    programTypes.sort();

    const programTypeSelect = document.getElementById('program-type');
    programTypeSelect.innerHTML = '<option value="all">All Program Types</option>';
    programTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        programTypeSelect.appendChild(option);
    });
}

let currentPage = 1;
const rowsPerPage = 50;
let filteredResults = [];

function displayResults(data) {
    filteredResults = data;
    const totalPages = Math.ceil(filteredResults.length / rowsPerPage);
    document.getElementById('total-pages').textContent = totalPages || 1;
    currentPage = Math.min(currentPage, totalPages || 1);
    document.getElementById('current-page').textContent = currentPage;

    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = '';

    const specificInstitute = document.getElementById('specific-institute')?.value || 'all';
    const institute = document.getElementById('institute').value;
    const isNIT = institute === 'nit' || (specificInstitute !== 'all' && specificInstitute.includes('NIT'));

    // Toggle visibility of Quota column
    const quotaColumns = document.querySelectorAll('.quota-column');
    quotaColumns.forEach(col => {
        col.style.display = isNIT ? '' : 'none';
    });

    // Adjust colspan based on visible columns
    const baseColspan = 10; // Total columns without Quota
    const colspan = baseColspan + (isNIT ? 1 : 0);

    if (filteredResults.length === 0) {
        resultsTable.innerHTML = `<tr><td colspan="${colspan}" class="text-center">No colleges found.</td></tr>`;
        document.getElementById('prev-page').disabled = true;
        document.getElementById('next-page').disabled = true;
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredResults.slice(startIndex, endIndex);

    paginatedData.forEach((item, index) => {
        const serialNumber = startIndex + index + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${serialNumber}</td>
            <td>${item.year}</td>
            <td>${item.institute}</td>
            <td class="quota-column" style="display: ${isNIT ? '' : 'none'};">${item.state_quota}</td>
            <td>${item.program}</td>
            <td>${item.duration} Years</td>
            <td>${item.programType}</td>
            <td>${item.category}</td>
            <td>${item.pool}</td>
            <td>${item.opening_rank}</td>
            <td>${item.closing_rank}</td>
        `;
        resultsTable.appendChild(row);
    });

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function changePage(direction) {
    currentPage += direction;
    displayResults(filteredResults);
}

function resetFilters() {
    // Reset Filter-Based Search fields
    document.getElementById('year').value = 'all';
    document.getElementById('institute').value = 'iit';
    document.getElementById('specific-institute-container').style.display = 'none';
    document.getElementById('quota-container').style.display = 'none';
    document.getElementById('state_quota').value = 'all';
    document.getElementById('hs_os_quota').value = 'both';
    document.getElementById('duration').value = 'all';
    document.getElementById('program').value = 'all';
    document.getElementById('program-type').value = 'all';
    document.getElementById('pool').value = 'all';
    document.getElementById('filter-category').value = 'all';
    
    // Reset Rank-Based Search fields
    document.getElementById('rank-category').value = 'all';
    document.getElementById('jee-rank').value = '';
    document.getElementById('rank-label').textContent = 'Enter your JEE Advanced rank';

    // Reset search input
    document.getElementById('universal-search').value = '';
    toggleClearButton();

    populateProgramDropdown();
    populateProgramTypeDropdown();
    predictColleges();
}

const loadingSpinner = document.getElementById('loading');

function showLoading() {
    loadingSpinner.style.display = 'block';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function predictColleges() {
    showLoading();
    const year = document.getElementById('year').value;
    const institute = document.getElementById('institute').value;
    const specificInstitute = document.getElementById('specific-institute')?.value || 'all';
    const stateQuota = document.getElementById('state_quota').value;
    const hsOsQuota = document.getElementById('hs_os_quota').value;
    const duration = document.getElementById('duration').value;
    const category = document.getElementById('rank-category').value;
    const program = document.getElementById('program').value;
    const programType = document.getElementById('program-type').value;
    const pool = document.getElementById('pool').value;
    const jeeRankInput = document.getElementById('jee-rank').value.trim().toUpperCase();
    const searchTerm = document.getElementById('universal-search').value.trim().toLowerCase();

    // Parse the JEE rank input for number and "P" suffix
    const isPreparatoryFilter = jeeRankInput === 'P' || jeeRankInput.endsWith('P');
    const jeeRank = jeeRankInput === 'P' ? NaN : parseInt(jeeRankInput.replace(/P$/, ''));

    if (!isNaN(jeeRank) && jeeRank < 0) {
        alert('JEE Rank cannot be negative.');
        hideLoading();
        return;
    }

    let filteredData = window.jeeData;

    // Apply institute filter
    filteredData = filteredData.filter(item => {
        let matchesInstitute = true;
        if (institute === 'iit') {
            matchesInstitute = item.institute.startsWith('IIT');
            if (specificInstitute !== 'all') {
                matchesInstitute = matchesInstitute && item.institute === specificInstitute;
            }
        } else if (institute === 'nit') {
            matchesInstitute = item.institute.startsWith('NIT');
            if (specificInstitute !== 'all') {
                matchesInstitute = matchesInstitute && item.institute === specificInstitute;
            }
        }
        return matchesInstitute;
    });

    // Apply year and round filter
    filteredData = filteredData.filter(item => {
        if (year === 'all') return true;
        const selectedYear = parseInt(year);
        let expectedRound;
        if (selectedYear >= 2017 && selectedYear <= 2019) {
            expectedRound = 7; // Round 7 for 2017–2019
        } else if (selectedYear >= 2020 && selectedYear <= 2023) {
            expectedRound = 6; // Round 6 for 2020–2023
        } else if (selectedYear === 2024) {
            expectedRound = 5; // Round 5 for 2024
        }
        return item.year === selectedYear && item.round === expectedRound;
    });

    // Apply quota filter for NITs
    if (institute === 'nit') {
        const isSpecificNIT = specificInstitute !== 'all' && specificInstitute.startsWith('NIT');
        const quotaFilter = isSpecificNIT ? hsOsQuota : stateQuota;
        
        if (quotaFilter === 'OS') {
            filteredData = filteredData.filter(item => item.state_quota === 'OS');
        } else if (quotaFilter === 'HS') {
            filteredData = filteredData.filter(item => item.state_quota === 'HS');
        }
        // For 'all' or 'both', no quota filter is applied
    }

    // Apply remaining filters
    filteredData = filteredData.filter(item => duration === 'all' || item.duration == duration);
    filteredData = filteredData.filter(item => category === 'all' || item.category === category);
    filteredData = filteredData.filter(item => program === 'all' || item.program === program);
    filteredData = filteredData.filter(item => programType === 'all' || item.programType === programType);

    // Apply pool (gender) filter, but ignore for 2017 since gender-based reservations started in 2018
    filteredData = filteredData.filter(item => {
        if (item.year === 2017) {
            return true; // Ignore pool filter for 2017
        }
        return pool === 'all' || item.pool === pool;
    });

    // Apply preparatory rank filter
    if (isPreparatoryFilter) {
        filteredData = filteredData.filter(item => isPreparatoryRank(item.closing_rank));
    } else {
        filteredData = filteredData.filter(item => !isPreparatoryRank(item.closing_rank));
    }

    // Apply JEE rank filter (only if a rank is provided)
    if (!isNaN(jeeRank) && jeeRank > 0) {
        filteredData = filteredData.filter(item => {
            const closingRank = parseRank(item.closing_rank);
            return jeeRank <= closingRank;
        });
        filteredData.sort((a, b) => {
            const diffA = Math.abs(parseRank(a.closing_rank) - jeeRank);
            const diffB = Math.abs(parseRank(b.closing_rank) - jeeRank);
            return diffA - diffB;
        });
    }

    // Apply universal search filter
    if (searchTerm) {
        filteredData = filteredData.filter(item => {
            return (
                item.institute.toLowerCase().includes(searchTerm) ||
                item.program.toLowerCase().includes(searchTerm) ||
                item.programType.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm) ||
                item.pool.toLowerCase().includes(searchTerm) ||
                (item.state_quota && item.state_quota.toLowerCase().includes(searchTerm)) ||
                item.opening_rank.toString().includes(searchTerm) ||
                item.closing_rank.toString().includes(searchTerm)
            );
        });
    }

    currentPage = 1;
    displayResults(filteredData);
    hideLoading();
}

function updateSpecificInstituteDropdown() {
    const institute = document.getElementById('institute').value;
    const specificInstituteContainer = document.getElementById('specific-institute-container');
    const specificInstituteSelect = document.getElementById('specific-institute');
    const quotaContainer = document.getElementById('quota-container');
    const stateQuotaSelect = document.getElementById('state_quota');
    const hsOsQuotaSelect = document.getElementById('hs_os_quota');
    const rankLabel = document.getElementById('rank-label');

    specificInstituteSelect.innerHTML = '<option value="all">All</option>';

    if (institute === 'iit') {
        specificInstituteContainer.style.display = 'block';
        quotaContainer.style.display = 'none';
        rankLabel.textContent = 'Enter your JEE Advanced rank';

        // Define the desired order of IITs
        const orderedIITs = [
            "IIT Bombay",
            "IIT Delhi",
            "IIT Kharagpur",
            "IIT Kanpur",
            "IIT Madras",
            "IIT Roorkee",
            "IIT Guwahati",
            "IIT Indore",
            "IIT Hyderabad",
            "IIT (BHU) Varanasi",
            "IIT (ISM) Dhanbad",
            "IIT Bhubaneswar",
            "IIT Mandi",
            "IIT Patna",
            "IIT Gandhinagar",
            "IIT Ropar",
            "IIT Jodhpur",
            "IIT Tirupati",
            "IIT Bhilai",
            "IIT Dharwad",
            "IIT Goa",
            "IIT Jammu",
            "IIT Palakkad"
        ];

        // Get all IITs from the data, excluding IIITs
        const iitsInData = [...new Set(window.jeeData
            .filter(item => item.institute.startsWith('IIT') && !item.institute.includes('IIIT'))
            .map(item => item.institute))];

        // Filter the ordered list to only include IITs present in the data
        const iitsToDisplay = orderedIITs.filter(iit => iitsInData.includes(iit));

        // Populate the dropdown in the specified order
        iitsToDisplay.forEach(iit => {
            const option = document.createElement('option');
            option.value = iit;
            option.textContent = iit;
            specificInstituteSelect.appendChild(option);
        });
    } else if (institute === 'nit') {
        specificInstituteContainer.style.display = 'block';
        quotaContainer.style.display = 'block';
        rankLabel.textContent = 'Enter your JEE Main rank';

        const nits = [...new Set(window.jeeData
            .filter(item => item.institute.startsWith('NIT'))
            .map(item => item.institute))];
        nits.sort(); // Sort alphabetically for NITs
        nits.forEach(nit => {
            const option = document.createElement('option');
            option.value = nit;
            option.textContent = nit;
            specificInstituteSelect.appendChild(option);
        });

        const specificInstitute = specificInstituteSelect.value || 'all';
        if (specificInstitute !== 'all' && specificInstitute.startsWith('NIT')) {
            stateQuotaSelect.style.display = 'none';
            hsOsQuotaSelect.style.display = 'block';
        } else {
            stateQuotaSelect.style.display = 'block';
            hsOsQuotaSelect.style.display = 'none';
        }
    }

    // Update Program Type dropdown when institute changes
    populateProgramTypeDropdown();
}

// Function to download filtered results as CSV
function downloadCSV() {
    if (filteredResults.length === 0) {
        alert('No data to download. Please apply filters to get some results.');
        return;
    }

    // Define CSV headers
    const headers = [
        'Serial No.',
        'Year',
        'Institute',
        'Quota',
        'Branch',
        'Duration',
        'Degree',
        'Category',
        'Gender',
        'Opening Rank',
        'Closing Rank'
    ];

    // Map the filtered results to CSV rows
    const csvRows = filteredResults.map((item, index) => {
        const serialNumber = index + 1;
        return [
            serialNumber,
            item.year,
            item.institute,
            item.state_quota || '', // Quota might be empty for IITs
            item.program,
            `${item.duration} Years`,
            item.programType,
            item.category,
            item.pool,
            item.opening_rank,
            item.closing_rank
        ].map(value => `"${value}"`).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'jee_college_predictor_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Load the JSON data for all years (2017–2024)
showLoading();
Promise.all([
    fetch('cleaned_2017_r7.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2017 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2018_r7.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2018 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2019_r7.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2019 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2020_r6.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2020 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2021_r6.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2021 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2022_r6.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2022 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2023_r6.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2023 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        }),
    fetch('cleaned_2024_r5.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error for 2024 data! Status: ${response.status} (${response.statusText})`);
            }
            return response.json();
        })
])
    .then(([data2017, data2018, data2019, data2020, data2021, data2022, data2023, data2024]) => {
        // Process 2017 data (no gender-based reservations)
        const processed2017 = data2017.map(item => {
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: "Gender-Neutral", // Explicitly set to Gender-Neutral for 2017
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: parseInt(item.Round),
                year: parseInt(item.Year)
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2018 data
        const processed2018 = data2018.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: parseInt(item.Round),
                year: parseInt(item.Year)
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2019 data
        const processed2019 = data2019.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: parseInt(item.Round),
                year: parseInt(item.Year)
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2020 data
        const processed2020 = data2020.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: parseInt(item.Round),
                year: parseInt(item.Year)
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2021 data
        const processed2021 = data2021.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: parseInt(item.Round),
                year: parseInt(item.Year)
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2022 data
        const processed2022 = data2022.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: parseInt(item.Round),
                year: parseInt(item.Year)
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2023 data
        const processed2023 = data2023.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: 6,
                year: 2023
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Process 2024 data
        const processed2024 = data2024.map(item => {
            const gender = item.Gender === "Female-only (including Supernumerary)" ? "Female-only" : item.Gender;
            let programType = item["Program Type"];
            if (item.Branch === "Architecture" || item.Branch === "Architecture and Planning") {
                programType = "Bachelor of Architecture (B.Arch)";
            } else if (item.Branch === "Planning") {
                programType = "Bachelor of Planning (B.Plan)";
            }
            return {
                institute: abbreviateInstituteName(item.Institute),
                program: item.Branch,
                programType: programType,
                duration: item.Duration,
                pool: gender,
                category: item["Seat Type"],
                state_quota: item.Quota,
                opening_rank: item["Opening Rank"],
                closing_rank: item["Closing Rank"],
                round: 5,
                year: 2024
            };
        })
        .filter(item => {
            const openingRank = parseRank(item.opening_rank);
            const closingRank = parseRank(item.closing_rank);
            const isValidInstitute = (item.institute.startsWith('IIT') && !item.institute.includes('IIIT')) || item.institute.startsWith('NIT');
            return !isNaN(openingRank) && !isNaN(closingRank) && isValidInstitute;
        });

        // Merge all datasets
        window.jeeData = [
            ...processed2017,
            ...processed2018,
            ...processed2019,
            ...processed2020,
            ...processed2021,
            ...processed2022,
            ...processed2023,
            ...processed2024
        ];

        populateProgramDropdown();
        populateProgramTypeDropdown();
        updateSpecificInstituteDropdown();
        predictColleges();
        hideLoading();
    })
    .catch(error => {
        console.error('Detailed error loading data:', error.message);
        hideLoading();
        alert('Failed to load data. Please try again later. Check the console for more details.');
    });

// Add sorting functionality
let sortDirection = {};
document.querySelectorAll('th').forEach(header => {
    header.addEventListener('click', () => {
        const columnMap = {
            'Serial No.': 'serialNumber',
            'Year': 'year',
            'Institute': 'institute',
            'Quota': 'state_quota',
            'Branch': 'program',
            'Duration': 'duration',
            'Degree': 'programType',
            'Category': 'category',
            'Gender': 'pool',
            'Opening Rank': 'opening_rank',
            'Closing Rank': 'closing_rank'
        };
        const columnText = header.textContent;
        const column = columnMap[columnText];
        const data = [...filteredResults];
        const direction = sortDirection[column] = !sortDirection[column];

        data.sort((a, b) => {
            let valA = a[column], valB = b[column];
            if (column === 'opening_rank' || column === 'closing_rank') {
                valA = parseRank(valA);
                valB = parseRank(valB);
            } else if (column === 'year' || column === 'duration') {
                valA = parseInt(valA);
                valB = parseInt(valB);
            }
            if (direction) return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });

        currentPage = 1;
        displayResults(data);
    });
});

// Initialize the clear button visibility on page load
document.addEventListener('DOMContentLoaded', toggleClearButton);