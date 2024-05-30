export let globalContext: any = {};

export function extractRelevantInformation(readmeContent: string) {
    // Store important context to feed into the LLM model
    const context: { [key: string]: string } = {};

    // Regular expression pattern to match all headers
    const pattern = /^##?\s*(.+)/gim;  // Matches lines that start with one or two hash symbols

    interface Match {
        header: string;
        keyword: string;
        index: number;
    }

    // Store all headers in the README file in an array
    const matches: Match[] = [];
    let match: RegExpExecArray | null;

    // Find all matching headers and their positions
    while ((match = pattern.exec(readmeContent)) !== null) {
        matches.push({
            header: match[0], // Match[0] contains the entire matched string
            keyword: match[1].toLowerCase().trim(), // Match[1] contains the part of the string that matches the first capturing group in the regex, followed by trim() which removes whitespace from both ends of a string
            index: match.index
        });
    }

    // Extract content between each header and the next one
    const sections = matches.map((match, i) => {
        const start = match.index;
        const end = i < matches.length - 1 ? matches[i + 1].index : readmeContent.length; // If it's the last header, use the end of the file as the end index
        const content = readmeContent.slice(start, end).trim();
        return {
            header: match.header,
            keyword: match.keyword,
            content: content
        };
    });

    // Specify the keywords you are interested in
    // Pattern inside the slashes is what the regex will match
    const relevantKeywords = [
        /about/, /description/, /guide/, /introduction/, /feature/, /overview/,
        /dependency/, /requirement/, /develop/, /prerequisite/, /config/, /script/, /install/, /usage/, /package/
    ];

    // Populate the context object with extracted sections
    // Updated keyword extraction logic, which checks for substrings within headers
    sections.forEach(section => {
        // Normalize header by removing any non-word characters and trimming spaces
        const normalizedHeader = section.header.toLowerCase().replace(/[^\w\s]/g, '').trim();

        // Check if any of the relevant keywords are part of the normalized header
        const keywordMatch = relevantKeywords.find(keyword => keyword.test(normalizedHeader));
        
        // If a keyword match is found, use it as the key in the context object
        if (keywordMatch) {
            context[keywordMatch.source] = section.content;
        }
    });

    return context;
}

export function updateContext(newContext: any) {
    globalContext = newContext;
}

export function getContext() {
    return globalContext;
}