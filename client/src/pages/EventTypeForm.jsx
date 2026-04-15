import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getEventTypes, createEventType, updateEventType } from '../api';
import { ArrowLeft } from 'lucide-react';

const EventTypeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Event Type - Calendly`;
  }, [isEdit]);

  const [formData, setFormData] = useState({
    name: '',
    durationMinutes: 30,
    slug: '',
    description: '',
    color: '#006bff',
    bufferBefore: 0,
    bufferAfter: 0,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { data: eventType, isLoading } = useQuery({
    queryKey: ['eventType', id],
    queryFn: () => getEventTypes().then(res => res.data.data.find(et => et.id === id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && eventType) {
      setFormData({
        name: eventType.name,
        durationMinutes: eventType.durationMinutes,
        slug: eventType.slug,
        description: eventType.description || '',
        color: eventType.color,
        bufferBefore: eventType.bufferBefore || 0,
        bufferAfter: eventType.bufferAfter || 0,
      });
    }
  }, [eventType, isEdit]);

  const createMutation = useMutation({
    mutationFn: createEventType,
    onSuccess: () => {
      queryClient.invalidateQueries(['eventTypes']);
      toast.success('Event type saved');
      navigate('/app/event-types');
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        setErrors({ slug: 'Slug already exists' });
        toast.error('Slug already exists');
      } else {
        toast.error('Failed to create event type');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEventType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventTypes']);
      toast.success('Event type updated');
      navigate('/app/event-types');
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        setErrors({ slug: 'Slug already exists' });
        toast.error('Slug already exists');
      } else {
        toast.error('Failed to update event type');
      }
    },
  });

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'name' && !value.trim()) {
      newErrors.name = 'Event name is required';
    } else if (field === 'slug' && !value.trim()) {
      newErrors.slug = 'Slug is required';
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name') {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = { name: true, slug: true };
    setTouched(allTouched);
    validateField('name', formData.name);
    validateField('slug', formData.slug);

    if (Object.keys(errors).length > 0 || !formData.name.trim() || !formData.slug.trim()) {
      toast.error('Please fix the errors');
      return;
    }

    const data = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      durationMinutes: Number(formData.durationMinutes),
      description: formData.description.trim(),
      color: formData.color,
      bufferBefore: Number(formData.bufferBefore),
      bufferAfter: Number(formData.bufferAfter),
    };
    if (isEdit) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const durations = [15, 30, 45, 60, 90, 120];
  const colors = [
    '#006bff', '#8247f5', '#0099ff', '#00a587',
    '#33a1fd', '#17c5cc', '#f8ba1e', '#e55cff'
  ];

  if (isEdit && isLoading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="w-full flex-col max-w-3xl mx-auto pt-4 pb-20">
      <Link to="/app/event-types" className="inline-flex items-center gap-2 text-sm font-semibold text-calendlyBlue hover:underline mb-6">
         <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      
      <div className="bg-white border text-left border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
           <h1 className="text-xl font-bold text-gray-900">
             {isEdit ? 'Edit Event Type' : 'New Event Type'}
           </h1>
           <p className="text-sm text-gray-500 mt-1">Set the basic details of your event type</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Event name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. 30 Minute Meeting"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Duration
            </label>
            <div className="flex flex-wrap gap-3">
              {durations.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => handleChange('durationMinutes', duration)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors border ${
                    formData.durationMinutes === duration
                      ? 'bg-blue-50 text-calendlyBlue border-calendlyBlue'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Event link *
            </label>
            <div className="flex items-center">
              <div className="px-4 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm font-medium">
                calendly.com/mankirat/
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                onBlur={() => handleBlur('slug')}
                className={`flex-1 px-4 py-2.5 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                  errors.slug ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
            {errors.slug && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Description / Instructions
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Write a summary and any details your invitee should know about the meeting."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-shadow"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Buffer before event
              </label>
              <select
                value={formData.bufferBefore}
                onChange={(e) => handleChange('bufferBefore', Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value={0}>0 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Buffer after event
              </label>
              <select
                value={formData.bufferAfter}
                onChange={(e) => handleChange('bufferAfter', Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value={0}>0 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Event color
            </label>
            <div className="flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && <span className="text-white text-lg leading-none transform -translate-y-px">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
           <button
             type="button"
             onClick={() => navigate('/app/event-types')}
             className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
           >
             Cancel
           </button>
           <button
             type="submit"
             onClick={handleSubmit}
             disabled={createMutation.isLoading || updateMutation.isLoading}
             className="px-6 py-2.5 rounded-full bg-calendlyBlue text-white font-bold hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
           >
             {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save & Continue'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default EventTypeForm;