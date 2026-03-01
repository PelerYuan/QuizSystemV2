import { useRef, useState } from 'react'
import OptionRow from './OptionRow'
import mediaService from '../../../services/media'
import { Trash2, X, Image as ImageIcon, TriangleAlert, Plus } from 'lucide-react'

const QuestionCard = ({ question, qIndex, actions }) => {
    const { removeQuestion, handleQuestionChange, addOption } = actions
    const fileInputRef = useRef(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            setIsUploading(true)
            const data = await mediaService.uploadImage(file)
            handleQuestionChange(qIndex, 'image', data.filename)
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to upload image')
        } finally {
            setIsUploading(false)
            event.target.value = ''
        }
    }

    const removeImage = () => {
        handleQuestionChange(qIndex, 'image', null)
    }

    return (
        <div id={`question-${qIndex}`} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">

            {/* Header & Delete Button */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-brand-700 flex items-center gap-2">
                    <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm">Q {qIndex + 1}</span>
                </h3>
                <button
                    onClick={() => removeQuestion(qIndex)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" /> Delete Question
                </button>
            </div>

            {/* Question Type Selector */}
            <div className="mb-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <label className="font-semibold text-slate-700 whitespace-nowrap">Question Type:</label>
                <select
                    className="w-full md:w-auto p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 font-medium text-slate-700"
                    value={question.uiType}
                    onChange={(e) => handleQuestionChange(qIndex, 'uiType', e.target.value)}
                >
                    <option value="SINGLE">Multiple Choice (Single Answer)</option>
                    <option value="MULTIPLE">Multiple Choice (Multiple Answers)</option>
                    <option value="TEXT">Text Input (Not Graded)</option>
                </select>
            </div>

            {/* Question Text */}
            <div className="mb-6">
                <label className="block font-semibold text-slate-700 mb-2">Question Text <span className="text-red-500">*</span></label>
                <textarea
                    className="w-full p-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow resize-y bg-slate-50"
                    rows="3"
                    value={question.Q}
                    onChange={(e) => handleQuestionChange(qIndex, 'Q', e.target.value)}
                    placeholder="Enter the question prompt here..."
                />
            </div>

            {/* Image Upload Area */}
            <div className="mb-8">
                <label className="block font-semibold text-slate-700 mb-2">Reference Image (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                />

                {question.image ? (
                    <div className="relative inline-block border border-slate-200 rounded-lg p-2 bg-slate-50">
                        <img src={`/api/uploads/${question.image}`} alt="Question visual" className="max-h-48 rounded object-contain" />
                        <button
                            onClick={removeImage}
                            className="absolute -top-3 -right-3 bg-white text-rose-500 hover:text-white hover:bg-rose-500 rounded-full p-1 shadow-md border border-slate-200 transition-colors w-8 h-8 flex items-center justify-center font-bold"
                            title="Remove image"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => !isUploading && fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-2
                            ${isUploading ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'bg-slate-50 border-brand-300 hover:bg-brand-50 hover:border-brand-500 text-slate-500 hover:text-brand-600'}`}
                    >
                        {isUploading ? (
                            <span className="font-semibold animate-pulse">Uploading image...</span>
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                <span className="font-semibold">Click to browse and upload an image</span>
                                <span className="text-xs text-slate-400">Max size 20MB.</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                <label className="block font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
                    {question.uiType === 'TEXT' ? 'Student Input Area' : 'Answer Options'}
                </label>

                {question.uiType === 'TEXT' ? (
                    <div className="bg-white border border-slate-200 border-dashed p-6 rounded-lg text-slate-400 text-center italic">
                        [ A text box will appear here for students to type their answer ]<br/>
                        <span className="text-xs text-amber-600 not-italic font-semibold mt-2 block flex items-center justify-center gap-1">
                            <TriangleAlert className="w-4 h-4 inline-block" /> Note: Fill-in-the-blank questions are not auto-graded by the system.
                        </span>
                    </div>
                ) : (
                    <div>
                        {question.options.map((opt, optIndex) => (
                            <OptionRow
                                key={optIndex}
                                option={opt}
                                qIndex={qIndex}
                                optIndex={optIndex}
                                uiType={question.uiType}
                                actions={actions}
                            />
                        ))}
                        <button
                            onClick={() => addOption(qIndex)}
                            className="mt-2 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1 p-2 hover:bg-brand-50 rounded-lg"
                        >
                            <Plus className="w-4 h-4" /> Add Option
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestionCard