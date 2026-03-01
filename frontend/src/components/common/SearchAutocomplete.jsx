import { useState, useEffect, Fragment } from 'react'
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, Transition } from '@headlessui/react'
import { useDebounce } from '../../hooks/useDebounce'
import { Search, X } from 'lucide-react' // 1. 引入 X 图标

const SearchAutocomplete = ({
                                placeholder = "Search...",
                                fetchSuggestions,   // (query, signal) => Promise<Array>
                                onSelect,           // (selectedItem) => void
                                onInputChange,      // (currentQuery) => void
                                getDisplayValue,    // (item) => string
                                renderItem,         // (item, isHighlighted) => ReactNode
                                clearAfterSelect = false
                            }) => {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSuggestions([])
            return
        }

        const controller = new AbortController()

        const loadSuggestions = async () => {
            setIsLoading(true)
            try {
                const results = await fetchSuggestions(debouncedQuery, controller.signal)

                if (!controller.signal.aborted) {
                    setSuggestions(results || [])
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("Autocomplete fetch failed:", error)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        loadSuggestions()

        return () => controller.abort()
    }, [debouncedQuery, fetchSuggestions])

    const handleSelect = (item) => {
        if (!item) return

        const displayVal = getDisplayValue ? getDisplayValue(item) : query

        if (clearAfterSelect) {
            setQuery('')
            if (onInputChange) onInputChange('')
        } else {
            setQuery(displayVal)
            if (onInputChange) onInputChange(displayVal)
        }

        onSelect(item)
    }

    const handleInputChange = (e) => {
        const val = e.target.value
        setQuery(val)
        if (onInputChange) onInputChange(val)
    }

    const handleClear = (e) => {
        e.preventDefault()
        setQuery('')
        setSuggestions([])
        if (onInputChange) onInputChange('')
    }

    return (
        <div className="relative w-full z-40">
            <Combobox value={null} onChange={handleSelect}>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 z-10 pointer-events-none">
                        <Search className="w-5 h-5" />
                    </span>

                    <ComboboxInput
                        className="w-full pl-10 pr-14 py-2.5 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all bg-white"
                        displayValue={() => query}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        autoComplete="off"
                    />

                    {isLoading && (
                        <span className={`absolute ${query ? 'right-9' : 'right-3'} top-2.5 text-brand-500 pointer-events-none transition-all`}>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                    )}

                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors z-10 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery(query)}
                >
                    <ComboboxOptions className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto focus:outline-none">
                        {suggestions.length === 0 && query.trim() && !isLoading ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No results found for "{query}"
                            </div>
                        ) : (
                            <div className="py-2">
                                {suggestions.map((item, index) => (
                                    <ComboboxOption
                                        key={item.submissionId || item.id || index}
                                        value={item}
                                        className={({ active }) =>
                                            `px-4 py-2 cursor-pointer transition-colors outline-none ${
                                                active ? 'bg-brand-50 border-l-4 border-brand-500' : 'text-slate-900 hover:bg-slate-50 border-l-4 border-transparent'
                                            }`
                                        }
                                    >
                                        {({ active }) => (
                                            renderItem ? renderItem(item, active) : <span>{getDisplayValue ? getDisplayValue(item) : JSON.stringify(item)}</span>
                                        )}
                                    </ComboboxOption>
                                ))}
                            </div>
                        )}
                    </ComboboxOptions>
                </Transition>
            </Combobox>
        </div>
    )
}

export default SearchAutocomplete